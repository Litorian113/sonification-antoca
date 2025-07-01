<script lang="ts">
	import { onMount } from "svelte";
	import * as THREE from "three";
	import earthquakeData from "../../data/earthquakeDATA.json";
	import ControlPanel from "../../lib/ControlPanel.svelte";

	let container: HTMLElement;
	let isPlaying = false;
	let currentIndex = 0;
	let animationSpeed = 150; // milliseconds between earthquakes
	let globe: THREE.Mesh;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;
	let controls: any;
	let earthquakeDots: THREE.Mesh[] = [];
	let persistentDots: THREE.Mesh[] = []; // For persistent earthquake points
	let audioContext: AudioContext;
	let playButton: HTMLButtonElement;

	// Globe rotation settings
	let globeRotationSpeed = 0.005; // Rotation speed for globes
	let isGlobeRotating = true; // Enable/disable globe rotation
	let isMapVisible = true; // Enable/disable world map visibility
	let gridGroup: THREE.Group; // Reference to the grid lines
	let persistentDotsGroup: THREE.Group; // Reference to persistent dots group
	let shockwavesGroup: THREE.Group; // Reference to shockwaves group for rotation sync
	let middleGlobeGroup: THREE.Group; // Reference to middle globe for rotation
	let innerGlobeGroup: THREE.Group; // Reference to inner globe for rotation

	// Instrument toggle states
	let useAlternativeInstruments = {
		deep: false,    // false = accordion, true = brass
		medium: false,  // false = piano, true = saxophone  
		shallow: false, // false = violin, true = clarinet
		catastrophic: false // false = percussion, true = gong
	};

	//Test Commit
	// Performance optimization: Pre-load audio buffers
	const audioBuffers = new Map<string, AudioBuffer>();
	let isAudioPreloaded = false;

	// Performance optimization: Pre-computed earthquake data
	let sortedEarthquakeData: any[] = [];

	// Performance optimization: Reusable geometry and materials
	let sharedShockwaveGeometry: THREE.SphereGeometry;
	const shaderMaterialPool: THREE.ShaderMaterial[] = [];

	// Performance optimization: Frame limiting
	let lastFrameTime = 0;
	const targetFPS = 60;
	const frameInterval = 1000 / targetFPS;

	// New Sound mapping with instrument toggles: Depth determines instrument, Magnitude determines pitch and volume
	const getSoundFile = (magnitude: number, depth: number): string => {
		if (depth > 100) {
			// Deep earthquakes: Accordion OR Brass
			if (useAlternativeInstruments.deep) {
				// Brass: numbered 1-6 (1=lowest, 6=highest)
				if (magnitude >= 7.5) return "/toggleInstruments/brassEnsemble/brass6.wav";
				else if (magnitude >= 7.0) return "/toggleInstruments/brassEnsemble/brass5.wav";
				else if (magnitude >= 6.5) return "/toggleInstruments/brassEnsemble/brass4.wav";
				else if (magnitude >= 6.0) return "/toggleInstruments/brassEnsemble/brass3.wav";
				else if (magnitude >= 5.8) return "/toggleInstruments/brassEnsemble/brass2.wav";
				else return "/toggleInstruments/brassEnsemble/brass1.wav";
			} else {
				// Original accordion mapping
				if (magnitude >= 7.5) return "/accordion/g2.wav";
				else if (magnitude >= 7.0) return "/accordion/f2.wav";
				else if (magnitude >= 6.5) return "/accordion/e2.wav";
				else if (magnitude >= 6.0) return "/accordion/d2.wav";
				else if (magnitude >= 5.8) return "/accordion/c2.wav";
				else if (magnitude >= 5.5) return "/accordion/b2.wav";
				else return "/accordion/a2.wav";
			}
		} else if (depth >= 30) {
			// Medium depth earthquakes: Piano OR Saxophone
			if (useAlternativeInstruments.medium) {
				// Saxophone: numbered 1-6 (1=lowest, 6=highest)
				if (magnitude >= 7.5) return "/toggleInstruments/saxophone/sax6.wav";
				else if (magnitude >= 7.0) return "/toggleInstruments/saxophone/sax5.wav";
				else if (magnitude >= 6.5) return "/toggleInstruments/saxophone/sax4.wav";
				else if (magnitude >= 6.0) return "/toggleInstruments/saxophone/sax3.wav";
				else if (magnitude >= 5.8) return "/toggleInstruments/saxophone/sax2.wav";
				else return "/toggleInstruments/saxophone/sax1.wav";
			} else {
				// Original piano mapping
				if (magnitude >= 7.5) return "/piano/C1.wav";
				else if (magnitude >= 7.0) return "/piano/E1.wav";
				else if (magnitude >= 6.5) return "/piano/G1.wav";
				else if (magnitude >= 6.0) return "/piano/C2.wav";
				else if (magnitude >= 5.8) return "/piano/E2.wav";
				else if (magnitude >= 5.5) return "/piano/C3.wav";
				else return "/piano/G4.wav";
			}
		} else {
			// Shallow earthquakes: Violin OR Clarinet
			if (useAlternativeInstruments.shallow) {
				// Clarinet: numbered 1-6 (1=lowest, 6=highest)
				if (magnitude >= 7.5) return "/toggleInstruments/clarinet/clari6.wav";
				else if (magnitude >= 7.0) return "/toggleInstruments/clarinet/clari5.wav";
				else if (magnitude >= 6.5) return "/toggleInstruments/clarinet/clari4.wav";
				else if (magnitude >= 6.0) return "/toggleInstruments/clarinet/clari3.wav";
				else if (magnitude >= 5.8) return "/toggleInstruments/clarinet/clari2.wav";
				else return "/toggleInstruments/clarinet/clari1.wav";
			} else {
				// Original violin mapping
				if (magnitude >= 7.5) return "/violin/g3.wav";
				else if (magnitude >= 7.0) return "/violin/c4.wav";
				else if (magnitude >= 6.5) return "/violin/e4.wav";
				else if (magnitude >= 6.0) return "/violin/g4.wav";
				else if (magnitude >= 5.8) return "/violin/a5.wav";
				else if (magnitude >= 5.5) return "/violin/a6.wav";
				else return "/violin/a6.wav";
			}
		}
	};

	// Calculate volume based on magnitude (0.3 to 1.0)
	const getVolumeForMagnitude = (
		magnitude: number,
		depth: number,
	): number => {
		// Map magnitude 5.5 (quietest) to 7.5 (loudest) linearly to volume 0.3 to 1.0
		const minMagnitude = 5.5;
		const maxMagnitude = 7.5;
		const minVolume = 0.01;
		const maxVolume = 3.0;

		// Clamp magnitude to the range [5.5, 7.5]
		const clampedMagnitude = Math.max(
			minMagnitude,
			Math.min(maxMagnitude, magnitude),
		);

		// Linear interpolation
		const volumeRange = maxVolume - minVolume;
		const magnitudeRange = maxMagnitude - minMagnitude;
		const normalizedMagnitude =
			(clampedMagnitude - minMagnitude) / magnitudeRange;

		return minVolume + normalizedMagnitude * volumeRange;
	};

	// Get percussion sound for magnitude 8+ events with Gong toggle
	const getPercussionSound = (): string => {
		if (useAlternativeInstruments.catastrophic) {
			// Use Gong for catastrophic events
			return "/toggleInstruments/gong/gong.mp3";
		} else {
			// Original percussion
			return "/percussion/b5.wav";
		}
	};

	// Color mapping based on new depth ranges and instruments with magnitude-based gradients
	const getColorForSound = (
		magnitude: number,
		depth: number,
	): THREE.Color => {
		// Special color for magnitude 8+ events (catastrophic earthquakes)
		if (magnitude >= 8.0) {
			return new THREE.Color(0xFFF4D2); // Light cream for catastrophic events
		}

		// Map magnitude 5.5-7.5 to color intensity (0.0 = weak, 1.0 = strong)
		const minMagnitude = 5.5;
		const maxMagnitude = 7.5;
		const clampedMagnitude = Math.max(minMagnitude, Math.min(maxMagnitude, magnitude));
		const intensity = (clampedMagnitude - minMagnitude) / (maxMagnitude - minMagnitude);

		if (depth > 100) {
			// Depth > 100: Accordion - Gradient from strong #F8AE31 to weak #E7A22E (ORANGE/YELLOW)
			const strongColor = new THREE.Color(0xF8AE31);
			const weakColor = new THREE.Color(0xE7A22E);
			return strongColor.clone().lerp(weakColor, 1.0 - intensity);
		} else if (depth >= 30) {
			// Depth 30-100: Piano - Gradient from strong #FF4F14 to weak #C43B29 (RED)
			const strongColor = new THREE.Color(0xFF4F14);
			const weakColor = new THREE.Color(0xC43B29);
			return strongColor.clone().lerp(weakColor, 1.0 - intensity);
		} else {
			// Depth 0-30: Violin - Gradient from strong #3398F1 to weak #1164B6 (BLUE)
			const strongColor = new THREE.Color(0x3398F1);
			const weakColor = new THREE.Color(0x1164B6);
			return strongColor.clone().lerp(weakColor, 1.0 - intensity);
		}
	};

	// Get globe radius based on earthquake depth for layered visualization
	const getGlobeRadius = (depth: number): number => {
		if (depth > 100) {
			// Deepest layer: Innermost globe
			return 5.0;
		} else if (depth >= 30) {
			// Middle layer: Medium globe
			return 6.0;
		} else {
			// Surface layer: Outer globe
			return 7.0;
		}
	};
	// Preload all audio files
	const preloadAudio = async () => {
		if (isAudioPreloaded) return;

		try {
			if (!audioContext) {
				audioContext = new AudioContext();
			}		const audioFiles = [
			// Original instruments
			// Accordion sounds
			"/accordion/g2.wav",
			"/accordion/f2.wav",
			"/accordion/e2.wav",
			"/accordion/d2.wav",
			"/accordion/c2.wav",
			"/accordion/b2.wav",
			"/accordion/a2.wav",

			// Piano sounds
			"/piano/C1.wav",
			"/piano/E1.wav",
			"/piano/G1.wav",
			"/piano/C3.wav",
			"/piano/E4.wav",
			"/piano/G4.wav",

			// Violin sounds
			"/violin/g3.wav",
			"/violin/c4.wav",
			"/violin/e4.wav",
			"/violin/g4.wav",
			"/violin/a5.wav",
			"/violin/a6.wav",

			// Percussion sounds for magnitude 8+ events
			"/percussion/b5.wav",

			// New alternative instruments
			// Brass sounds (1-6, 1=lowest)
			"/toggleInstruments/brassEnsemble/brass1.wav",
			"/toggleInstruments/brassEnsemble/brass2.wav",
			"/toggleInstruments/brassEnsemble/brass3.wav",
			"/toggleInstruments/brassEnsemble/brass4.wav",
			"/toggleInstruments/brassEnsemble/brass5.wav",
			"/toggleInstruments/brassEnsemble/brass6.wav",

			// Saxophone sounds (1-6, 1=lowest)
			"/toggleInstruments/saxophone/sax1.wav",
			"/toggleInstruments/saxophone/sax2.wav",
			"/toggleInstruments/saxophone/sax3.wav",
			"/toggleInstruments/saxophone/sax4.wav",
			"/toggleInstruments/saxophone/sax5.wav",
			"/toggleInstruments/saxophone/sax6.wav",

			// Clarinet sounds (1-6, 1=lowest)
			"/toggleInstruments/clarinet/clari1.wav",
			"/toggleInstruments/clarinet/clari2.wav",
			"/toggleInstruments/clarinet/clari3.wav",
			"/toggleInstruments/clarinet/clari4.wav",
			"/toggleInstruments/clarinet/clari5.wav",
			"/toggleInstruments/clarinet/clari6.wav",

			// Gong sound (single file)
			"/toggleInstruments/gong/gong.mp3",
		];

			const loadPromises = audioFiles.map(async (file) => {
				try {
					const response = await fetch(file);
					const arrayBuffer = await response.arrayBuffer();
					const audioBuffer =
						await audioContext.decodeAudioData(arrayBuffer);
					audioBuffers.set(file, audioBuffer);
				} catch (error) {
					console.warn(`Failed to load audio file: ${file}`, error);
				}
			});

			await Promise.all(loadPromises);
			isAudioPreloaded = true;
			console.log("Audio preloading completed");
		} catch (error) {
			console.error("Audio preloading failed:", error);
		}
	};
	const playSound = async (
		soundFile: string,
		magnitude: number,
		depth: number,
	) => {
		const instrument = getInstrumentByDepth(depth);
		if (!instrumentEnabled[instrument]) return; // Filtered out

		try {
			if (!audioContext) {
				audioContext = new AudioContext();
			}

			const volume = getVolumeForMagnitude(magnitude, depth);

			// Use preloaded buffer if available
			const audioBuffer = audioBuffers.get(soundFile);
			if (audioBuffer) {
				const source = audioContext.createBufferSource();
				const gainNode = audioContext.createGain();

				source.buffer = audioBuffer;
				gainNode.gain.value = volume;

				source.connect(gainNode);
				gainNode.connect(audioContext.destination);
				source.start();
				return;
			}

			// Fallback to dynamic loading
			const response = await fetch(soundFile);
			const arrayBuffer = await response.arrayBuffer();
			const decodedBuffer =
				await audioContext.decodeAudioData(arrayBuffer);

			const source = audioContext.createBufferSource();
			const gainNode = audioContext.createGain();

			source.buffer = decodedBuffer;
			gainNode.gain.value = volume;

			source.connect(gainNode);
			gainNode.connect(audioContext.destination);
			source.start();
		} catch (error) {
			console.error("Error playing sound:", error);
		}
	};

	// Play percussion sound for catastrophic earthquakes (magnitude 8+)
	const playPercussionSound = async (magnitude: number) => {
		// Percussion always plays if any instrument is enabled (or you can add a separate toggle)
		if (
			!instrumentEnabled.accordion &&
			!instrumentEnabled.piano &&
			!instrumentEnabled.violin
		)
			return;

		try {
			if (!audioContext) {
				audioContext = new AudioContext();
			}

			const percussionFile = getPercussionSound();
			// Use higher volume for catastrophic events (0.8-1.0)
			const volume = Math.max(
				0.8,
				Math.min(1.0, (magnitude - 7.0) / 2.0),
			);

			// Use preloaded buffer if available
			const audioBuffer = audioBuffers.get(percussionFile);
			if (audioBuffer) {
				const source = audioContext.createBufferSource();
				const gainNode = audioContext.createGain();

				source.buffer = audioBuffer;
				gainNode.gain.value = volume;

				source.connect(gainNode);
				gainNode.connect(audioContext.destination);
				source.start();
				return;
			}

			// Fallback to dynamic loading
			const response = await fetch(percussionFile);
			const arrayBuffer = await response.arrayBuffer();
			const decodedBuffer =
				await audioContext.decodeAudioData(arrayBuffer);

			const source = audioContext.createBufferSource();
			const gainNode = audioContext.createGain();

			source.buffer = decodedBuffer;
			gainNode.gain.value = volume;

			source.connect(gainNode);
			gainNode.connect(audioContext.destination);
			source.start();
		} catch (error) {
			console.error("Error playing percussion sound:", error);
		}
	};

	const createShockwave = (magnitude: number, depth: number) => {
		// Get the appropriate globe radius for this depth
		const globeRadius = getGlobeRadius(depth);

		// Calculate magnitude-based parameters for realistic earthquake scaling
		// Earthquake magnitude scale is logarithmic, so we need to scale accordingly
		const getMaxRadiusForMagnitude = (mag: number): number => {
			// Scale based on realistic earthquake impact zones
			// Magnitude 1-2: Very local (0.3-0.5)
			// Magnitude 3-4: Local (0.6-1.0)
			// Magnitude 5-6: Regional (1.2-1.8)
			// Magnitude 7+: Major/Great (2.0-3.0)
			if (mag >= 8.0)
				return 3.0; // Great earthquake
			else if (mag >= 7.0)
				return 2.4; // Major earthquake
			else if (mag >= 6.0)
				return 1.8; // Strong earthquake
			else if (mag >= 5.0)
				return 1.2; // Moderate earthquake
			else if (mag >= 4.0)
				return 0.8; // Light earthquake
			else if (mag >= 3.0)
				return 0.6; // Minor earthquake
			else if (mag >= 2.0)
				return 0.4; // Micro earthquake
			else return 0.3; // Very minor earthquake
		};

		const getRingWidthForMagnitude = (mag: number): number => {
			// Stronger earthquakes have wider shock fronts
			// Scale from 0.02 (very thin) to 0.08 (thick)
			const baseWidth = 0.02;
			const widthMultiplier = Math.pow(2, (mag - 2.0) / 2.0); // Exponential scaling
			return Math.min(0.08, baseWidth * widthMultiplier);
		};

		const getDurationForMagnitude = (mag: number): number => {
			// Stronger earthquakes have longer-lasting effects
			// Scale from 1500ms (weak) to 4000ms (very strong)
			const baseDuration = 1500;
			const durationMultiplier = Math.pow(1.5, mag - 2.0);
			return Math.min(4000, baseDuration * durationMultiplier);
		};

		const maxRadius = getMaxRadiusForMagnitude(magnitude);
		const ringWidth = getRingWidthForMagnitude(magnitude);
		const duration = getDurationForMagnitude(magnitude);

		// Create geometry sized for the specific depth layer
		const shockwaveGeometry = new THREE.SphereGeometry(
			globeRadius + 0.02,
			128,
			64,
			0,
			Math.PI * 2,
			0,
			Math.PI,
		);

		// Color based on depth and instrument mapping (same as dots)
		const color = getColorForSound(magnitude, depth);

		// Create a shader material for the curved shockwave effect
		const shaderMaterial = new THREE.ShaderMaterial({
			vertexShader: `
				varying vec3 vPosition;
				varying vec3 vNormal;
				varying float vDistance;
				uniform vec3 epicenter;
				
				void main() {
					vPosition = position;
					vNormal = normal;
					vDistance = distance(position, epicenter);
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: `
				uniform float time;
				uniform float maxRadius;
				uniform float ringWidth;
				uniform vec3 color;
				uniform vec3 epicenter;
				uniform float globeRadius;
				varying vec3 vPosition;
				varying vec3 vNormal;
				varying float vDistance;
				
				void main() {
					// Calculate distance from epicenter on the sphere surface
					float angularDistance = acos(dot(normalize(vPosition), normalize(epicenter)));
					float sphericalDistance = globeRadius * angularDistance;
					
					// Create expanding ring effect
					float ringRadius = time * maxRadius;
					
					float ringDistance = abs(sphericalDistance - ringRadius);
					float alpha = 1.0 - (ringDistance / ringWidth);
					alpha = clamp(alpha, 0.0, 1.0);
					
					// Slower fade out for stronger earthquakes, faster for weaker ones
					float fadeRate = 0.7 + (maxRadius / 6.0); // Stronger earthquakes fade slower
					alpha *= (1.0 - time * fadeRate);
					
					// Better hemisphere clipping to avoid edge artifacts
					float facing = dot(normalize(vPosition), normalize(epicenter));
					alpha *= smoothstep(0.1, 0.7, facing);
					
					// Additional check to avoid edge artifacts
					if (facing < 0.05) alpha = 0.0;
					
					gl_FragColor = vec4(color, alpha);
				}
			`,
			uniforms: {
				time: { value: 0 },
				maxRadius: { value: maxRadius },
				ringWidth: { value: ringWidth },
				color: { value: color },
				epicenter: { value: new THREE.Vector3(0, 0, 0) },
				globeRadius: { value: globeRadius },
			},
			transparent: true,
			side: THREE.DoubleSide,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
		});

		const shockwave = new THREE.Mesh(shockwaveGeometry, shaderMaterial);

		// Store animation properties
		shockwave.userData = {
			magnitude,
			startTime: Date.now(),
			duration: duration, // Use magnitude-based duration
			material: shaderMaterial,
		};

		return shockwave;
	};

	// Create special green shockwave for catastrophic earthquakes (magnitude 8+)
	const createCatastrophicShockwave = (
		magnitude: number,
		lat: number,
		lon: number,
	) => {
		// Always use outer globe for maximum visual impact
		const globeRadius = 7.0;

		// Create geometry for outer globe
		const shockwaveGeometry = new THREE.SphereGeometry(
			globeRadius + 0.05, // Slightly larger for prominence
			128,
			64,
			0,
			Math.PI * 2,
			0,
			Math.PI,
		);

		// Light cream color for catastrophic events
		const catastrophicColor = new THREE.Color(0xFFF4D2);

		// Impact radius for catastrophic events - smaller than before
		const maxRadius = 2.2; // Reasonable size for magnitude 8+ events
		const ringWidth = 0.08; // Slightly thinner ring
		const duration = 4000; // Shorter duration (4 seconds)

		// Create shader material for catastrophic shockwave
		const shaderMaterial = new THREE.ShaderMaterial({
			vertexShader: `
				varying vec3 vPosition;
				varying vec3 vNormal;
				varying float vDistance;
				uniform vec3 epicenter;
				
				void main() {
					vPosition = position;
					vNormal = normal;
					vDistance = distance(position, epicenter);
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			fragmentShader: `
				uniform float time;
				uniform float maxRadius;
				uniform float ringWidth;
				uniform vec3 color;
				uniform vec3 epicenter;
				uniform float globeRadius;
				varying vec3 vPosition;
				varying vec3 vNormal;
				varying float vDistance;
				
				void main() {
					// Calculate distance from epicenter on the sphere surface
					float angularDistance = acos(dot(normalize(vPosition), normalize(epicenter)));
					float sphericalDistance = globeRadius * angularDistance;
					
					// Create expanding ring effect
					float ringRadius = time * maxRadius;
					
					float ringDistance = abs(sphericalDistance - ringRadius);
					float alpha = 1.0 - (ringDistance / ringWidth);
					alpha = clamp(alpha, 0.0, 1.0);
					
					// Very slow fade for catastrophic events
					alpha *= (1.0 - time * 0.4);
					
					// Enhanced visibility with brighter glow
					alpha *= 1.5;
					alpha = clamp(alpha, 0.0, 1.0);
					
					// Better hemisphere clipping
					float facing = dot(normalize(vPosition), normalize(epicenter));
					alpha *= smoothstep(0.1, 0.7, facing);
					
					if (facing < 0.05) alpha = 0.0;
					
					gl_FragColor = vec4(color, alpha);
				}
			`,
			uniforms: {
				time: { value: 0 },
				maxRadius: { value: maxRadius },
				ringWidth: { value: ringWidth },
				color: { value: catastrophicColor },
				epicenter: { value: new THREE.Vector3(0, 0, 0) },
				globeRadius: { value: globeRadius },
			},
			transparent: true,
			side: THREE.DoubleSide,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
		});

		const shockwave = new THREE.Mesh(shockwaveGeometry, shaderMaterial);

		// Convert lat/lon to epicenter position
		const phi = (90 - lat) * (Math.PI / 180);
		const theta = (lon + 180) * (Math.PI / 180);
		const x = -(globeRadius * Math.sin(phi) * Math.cos(theta));
		const z = globeRadius * Math.sin(phi) * Math.sin(theta);
		const y = globeRadius * Math.cos(phi);
		const epicenterPosition = new THREE.Vector3(x, y, z);

		// Set epicenter position in shader
		shaderMaterial.uniforms.epicenter.value = epicenterPosition
			.clone()
			.normalize()
			.multiplyScalar(globeRadius);

		// Store animation properties
		shockwave.userData = {
			magnitude,
			startTime: Date.now(),
			duration: duration,
			material: shaderMaterial,
		};

		return shockwave;
	};

	const addEarthquakeShockwave = (quake: any) => {
		const lat = quake.Latitude;
		const lon = quake.Longitude;
		const magnitude = quake.Magnitude;
		const depth = quake.Depth;

		const instrument = getInstrumentByDepth(depth);

		// Only show shockwave/ring if instrument is enabled
		if (!instrumentEnabled[instrument]) {
			// Still create persistent dot (it will be hidden by filter)
			createPersistentDot(lat, lon, magnitude, depth);
			return;
		}

		// Convert lat/lon to 3D coordinates on sphere surface
		const phi = (90 - lat) * (Math.PI / 180);
		const theta = (lon + 180) * (Math.PI / 180);

		// Get the appropriate globe radius for this depth
		const globeRadius = getGlobeRadius(depth);

		const x = -(globeRadius * Math.sin(phi) * Math.cos(theta));
		const z = globeRadius * Math.sin(phi) * Math.sin(theta);
		const y = globeRadius * Math.cos(phi);

		const epicenterPosition = new THREE.Vector3(x, y, z);
		const shockwave = createShockwave(magnitude, depth);

		// Set the epicenter position in the shader (normalized for the specific globe size)
		shockwave.userData.material.uniforms.epicenter.value = epicenterPosition
			.clone()
			.normalize()
			.multiplyScalar(globeRadius);

		// Position the shockwave at the globe center (the shader will handle the positioning)
		shockwave.position.set(0, 0, 0);

		shockwavesGroup.add(shockwave);
		earthquakeDots.push(shockwave);

		// Create persistent dot at earthquake epicenter
		createPersistentDot(lat, lon, magnitude, depth);

		// Play sound with volume based on magnitude
		const soundFile = getSoundFile(magnitude, depth);
		playSound(soundFile, magnitude, depth);

		// For catastrophic earthquakes (magnitude 8+), add additional effects
		if (magnitude >= 8.0) {
			// Play percussion sound
			playPercussionSound(magnitude);

			// Create additional cream-colored shockwave on outer globe for visual impact
			const catastrophicShockwave = createCatastrophicShockwave(
				magnitude,
				lat,
				lon,
			);
			catastrophicShockwave.position.set(0, 0, 0);
			shockwavesGroup.add(catastrophicShockwave);
			earthquakeDots.push(catastrophicShockwave);
		}
	};

	const clearDots = () => {
		earthquakeDots.forEach((shockwave) => {
			shockwavesGroup.remove(shockwave);
			// Only dispose materials, not shared geometry
			if (Array.isArray(shockwave.material)) {
				shockwave.material.forEach((mat: any) => mat.dispose());
			} else {
				(shockwave.material as any).dispose();
			}
		});
		earthquakeDots = [];
	};

	const clearPersistentDots = () => {
		persistentDots.forEach((dot) => {
			persistentDotsGroup.remove(dot);
			if (Array.isArray(dot.material)) {
				dot.material.forEach((mat: any) => mat.dispose());
			} else {
				(dot.material as any).dispose();
			}
			dot.geometry.dispose();
		});
		persistentDots = [];
	};

	const updateShockwaves = () => {
		const currentTime = Date.now();

		// Use reverse iteration for safe removal during iteration
		for (let i = earthquakeDots.length - 1; i >= 0; i--) {
			const shockwave = earthquakeDots[i];
			const userData = shockwave.userData;
			const elapsed = currentTime - userData.startTime;
			const progress = elapsed / userData.duration;

			if (progress >= 1) {
				// Remove finished shockwave
				shockwavesGroup.remove(shockwave);
				// Note: Shared geometry should not be disposed here
				if (Array.isArray(shockwave.material)) {
					shockwave.material.forEach((mat: any) => mat.dispose());
				} else {
					(shockwave.material as any).dispose();
				}
				earthquakeDots.splice(i, 1);
			} else {
				// Update shader uniforms for animation
				userData.material.uniforms.time.value = progress;
			}
		}
	};

	let currentYear: number | null = null;
	let currentDate: string | null = null;
	let hasPlayed = false;

	const playAnimation = async () => {
		if (isPlaying) return;

		isPlaying = true;
		hasPlayed = true;
		clearDots();

		const playNext = () => {
			if (!isPlaying || currentIndex >= sortedEarthquakeData.length) {
				isPlaying = false;
				return;
			}

			const quake = sortedEarthquakeData[currentIndex];
			addEarthquakeShockwave(quake);

			// Set currentYear and currentDate from quake.Date
			if (quake.Date) {
				const date = new Date(quake.Date);
				const year = date.getFullYear();
				if (!isNaN(year)) {
					currentYear = year;
					selectedYear = year; // <-- Add this line to sync the slider
					// Format date as "DD.MM.YYYY"
					const day = String(date.getDate()).padStart(2, '0');
					const month = String(date.getMonth() + 1).padStart(2, '0');
					currentDate = `${day}.${month}.${year}`;
				}
			}

			currentIndex++;
			setTimeout(playNext, animationSpeed);
		};

		playNext();
	};

	const stopAnimation = () => {
		isPlaying = false;
		// Do NOT clear currentYear, so it stays visible and resumes from where it left off
	};

	// Create grid lines for latitude and longitude on all three depth layers
	function createGridLines() {
		const gridGroup = new THREE.Group();

		// Define the three globe layers with different visual properties
		const globeLayers = [
			{ 
				radius: 7.0,    // Outer globe (shallow earthquakes 0-30km)
				color: 0x3398F1, // Blue tint
				opacity: 0.12,
				name: 'shallow'
			},
			{ 
				radius: 6.0,    // Middle globe (medium earthquakes 30-100km)
				color: 0xFF4F14, // Red tint (swapped from orange)
				opacity: 0.10,
				name: 'medium'
			},
			{ 
				radius: 5.0,    // Inner globe (deep earthquakes >100km)
				color: 0xF8AE31, // Orange tint (swapped from red)
				opacity: 0.08,
				name: 'deep'
			}
		];

		// Create grid lines for each globe layer
		globeLayers.forEach(layer => {
			// Create material with layer-specific color and opacity
			const gridMaterial = new THREE.LineBasicMaterial({
				color: layer.color,
				opacity: layer.opacity,
				transparent: true,
			});

			// Latitude lines (horizontal circles)
			for (let lat = -80; lat <= 80; lat += 20) {
				const phi = (90 - lat) * (Math.PI / 180);
				const geometry = new THREE.BufferGeometry();
				const points = [];

				for (let i = 0; i <= 64; i++) {
					const theta = (i / 64) * Math.PI * 2;
					const x = Math.sin(phi) * Math.cos(theta) * layer.radius;
					const y = Math.cos(phi) * layer.radius;
					const z = Math.sin(phi) * Math.sin(theta) * layer.radius;
					points.push(new THREE.Vector3(x, y, z));
				}

				geometry.setFromPoints(points);
				const line = new THREE.Line(geometry, gridMaterial);
				line.userData.layer = layer.name;
				gridGroup.add(line);
			}

			// Longitude lines (vertical semicircles)
			for (let lng = -180; lng < 180; lng += 30) {
				const geometry = new THREE.BufferGeometry();
				const points = [];

				for (let i = 0; i <= 32; i++) {
					const phi = (i / 32) * Math.PI;
					const theta = lng * (Math.PI / 180);
					const x = Math.sin(phi) * Math.cos(theta) * layer.radius;
					const y = Math.cos(phi) * layer.radius;
					const z = Math.sin(phi) * Math.sin(theta) * layer.radius;
					points.push(new THREE.Vector3(x, y, z));
				}

				geometry.setFromPoints(points);
				const line = new THREE.Line(geometry, gridMaterial);
				line.userData.layer = layer.name;
				gridGroup.add(line);
			}
		});

		scene.add(gridGroup);
		return gridGroup; // Return reference for rotation
	}

	// Country Borders System - Using Natural Earth Data
	let countryBordersGroup: THREE.Group | null = null;

	// Create country borders overlay using Natural Earth data
	async function createCountryBordersOverlay() {
		try {
			console.log("Loading country borders from Natural Earth...");
			
			// Create borders group
			countryBordersGroup = new THREE.Group();
			
			// Try to load from Natural Earth via CDN
			const bordersTexture = await loadCountryBordersTexture();
			
			if (bordersTexture) {
				// Create a slightly larger sphere for borders overlay
				const bordersGeometry = new THREE.SphereGeometry(7.01, 256, 256);
				
				// Create material with the borders texture
				const bordersMaterial = new THREE.MeshBasicMaterial({
					map: bordersTexture,
					transparent: true,
					opacity: 0.8, // Erhöhte Opazität für bessere Sichtbarkeit
					side: THREE.FrontSide,
					depthWrite: false,
					blending: THREE.NormalBlending,
				});
				
				const bordersMesh = new THREE.Mesh(bordersGeometry, bordersMaterial);
				countryBordersGroup.add(bordersMesh);
				
				scene.add(countryBordersGroup);
				console.log("Country borders loaded successfully!");
			} else {
				console.warn("Failed to load country borders, creating fallback");
				await createFallbackBorders();
			}
		} catch (error) {
			console.error("Error creating country borders:", error);
			await createFallbackBorders();
		}
	}

	// Load country borders texture from Natural Earth
	async function loadCountryBordersTexture(): Promise<THREE.Texture | null> {
		// Natural Earth sources (in order of preference)
		const sources = [
			"https://cdn.jsdelivr.net/npm/world-atlas@3/countries-50m.json",
			"https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
			"https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson"
		];

		for (const source of sources) {
			try {
				console.log(`Trying to load from: ${source}`);
				const response = await fetch(source);
				
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}
				
				const data = await response.json();
				console.log("GeoJSON data loaded, creating texture...");
				
				// Create texture from GeoJSON data
				const texture = createTextureFromGeoJSON(data);
				
				if (texture) {
					console.log("Texture created successfully!");
					return texture;
				}
			} catch (error) {
				console.warn(`Failed to load from ${source}:`, error);
			}
		}

		return null;
	}

	// Create texture from GeoJSON data
	function createTextureFromGeoJSON(geoData: any): THREE.Texture | null {
		try {
			// Create high-resolution canvas for world map
			const canvas = document.createElement('canvas');
			canvas.width = 4096;  // Erhöht von 2048
			canvas.height = 2048; // Erhöht von 1024
			const ctx = canvas.getContext('2d');
			
			if (!ctx) {
				throw new Error("Could not get 2D context");
			}

			// Enable high-quality rendering
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = 'high';

			// Clear with transparent background
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			
			// Set up drawing style for country borders with higher quality
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'; // Erhöhte Opazität für bessere Sichtbarkeit
			ctx.lineWidth = 2; // Erhöhte Linienstärke
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			
			// Handle both TopoJSON and GeoJSON formats
			let features;
			if (geoData.type === 'Topology' && geoData.objects) {
				// TopoJSON format (Natural Earth) - try to handle without topojson library
				console.warn("TopoJSON format detected but library not available, trying GeoJSON fallback");
				return null;
			} else if (geoData.type === 'FeatureCollection') {
				// GeoJSON format
				features = geoData.features;
			} else if (geoData.features) {
				// Sometimes wrapped differently
				features = geoData.features;
			} else {
				console.warn("Unknown data format:", geoData);
				return null;
			}

			console.log(`Processing ${features.length} country features...`);

			// Draw each country's borders
			for (const feature of features) {
				if (feature.geometry) {
					drawGeometry(ctx, feature.geometry, canvas.width, canvas.height);
				}
			}

			// Create Three.js texture from canvas
			const texture = new THREE.CanvasTexture(canvas);
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.ClampToEdgeWrapping;
			texture.magFilter = THREE.LinearFilter;
			texture.minFilter = THREE.LinearMipmapLinearFilter;
			texture.flipY = false; // Important for proper orientation
			texture.generateMipmaps = true; // Bessere Qualität bei verschiedenen Distanzen
			texture.anisotropy = renderer.capabilities.getMaxAnisotropy(); // Maximale anisotrope Filterung
			
			return texture;
		} catch (error) {
			console.error("Error creating texture from GeoJSON:", error);
			return null;
		}
	}

	// Draw geometry (polygons/lines) on canvas
	function drawGeometry(ctx: CanvasRenderingContext2D, geometry: any, width: number, height: number) {
		if (!geometry || !geometry.coordinates) return;

		const type = geometry.type;
		
		if (type === 'Polygon') {
			drawPolygon(ctx, geometry.coordinates, width, height);
		} else if (type === 'MultiPolygon') {
			for (const polygon of geometry.coordinates) {
				drawPolygon(ctx, polygon, width, height);
			}
		} else if (type === 'LineString') {
			drawLineString(ctx, geometry.coordinates, width, height);
		} else if (type === 'MultiLineString') {
			for (const line of geometry.coordinates) {
				drawLineString(ctx, line, width, height);
			}
		}
	}

	// Draw polygon (country border)
	function drawPolygon(ctx: CanvasRenderingContext2D, coordinates: number[][][], width: number, height: number) {
		for (const ring of coordinates) {
			if (ring.length < 2) continue;
			
			ctx.beginPath();
			
			for (let i = 0; i < ring.length; i++) {
				const [lon, lat] = ring[i];
				
				// Convert geographic coordinates to canvas coordinates
				// Longitude: -180 to 180 -> 0 to width
				// Latitude: -90 to 90 -> 0 to height (corrected for proper orientation)
				const x = (lon + 180) * (width / 360);
				const y = (lat + 90) * (height / 180);
				
				if (i === 0) {
					ctx.moveTo(x, y);
				} else {
					ctx.lineTo(x, y);
				}
			}
			
			ctx.stroke();
		}
	}

	// Draw line string
	function drawLineString(ctx: CanvasRenderingContext2D, coordinates: number[][], width: number, height: number) {
		if (coordinates.length < 2) return;
		
		ctx.beginPath();
		
		for (let i = 0; i < coordinates.length; i++) {
			const [lon, lat] = coordinates[i];
			const x = (lon + 180) * (width / 360);
			const y = (lat + 90) * (height / 180);
			
			if (i === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		}
		
		ctx.stroke();
	}

	// Fallback: Create simple borders from static SVG
	async function createFallbackBorders() {
		try {
			console.log("Creating fallback world map...");
			
			// Try to load from local static file first
			let svgContent = await loadLocalWorldSVG();
			
			if (!svgContent) {
				// Create a basic world outline as fallback
				svgContent = createBasicWorldSVG();
			}
			
			if (svgContent) {
				const texture = await createTextureFromSVG(svgContent);
				
				if (texture) {
					const bordersGeometry = new THREE.SphereGeometry(7.01, 256, 256);
					const bordersMaterial = new THREE.MeshBasicMaterial({
						map: texture,
						transparent: true,
						opacity: 0.4,
						side: THREE.FrontSide,
					});
					
					const bordersMesh = new THREE.Mesh(bordersGeometry, bordersMaterial);
					
					if (countryBordersGroup) {
						countryBordersGroup.add(bordersMesh);
					}
					
					console.log("Fallback borders created!");
				}
			}
		} catch (error) {
			console.error("Failed to create fallback borders:", error);
		}
	}

	// Load world map from local static file
	async function loadLocalWorldSVG(): Promise<string | null> {
		try {
			const response = await fetch('/static/map/world.svg');
			if (response.ok) {
				return await response.text();
			}
		} catch (error) {
			console.warn("Local world.svg not found");
		}
		return null;
	}

	// Create basic world SVG outline
	function createBasicWorldSVG(): string {
		return `
			<svg width="360" height="180" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<style>
						.country-border { 
							fill: none; 
							stroke: rgba(255,255,255,0.4); 
							stroke-width: 0.5; 
						}
					</style>
				</defs>
				<!-- Simplified world continents outline -->
				<path class="country-border" d="M20,60 Q80,40 140,60 T220,70 Q280,50 340,70 L340,120 Q280,140 220,130 T140,120 Q80,140 20,120 Z"/>
				<path class="country-border" d="M60,100 Q100,90 140,100 T200,110 L200,140 Q140,150 100,140 T60,130 Z"/>
				<path class="country-border" d="M240,90 Q280,80 320,90 L320,110 Q280,120 240,110 Z"/>
			</svg>
		`;
	}

	// Create texture from SVG content
	async function createTextureFromSVG(svgContent: string): Promise<THREE.Texture | null> {
		try {
			const canvas = document.createElement('canvas');
			canvas.width = 4096;  // Erhöht von 2048
			canvas.height = 2048; // Erhöht von 1024
			const ctx = canvas.getContext('2d');
			
			if (!ctx) return null;

			// Enable high-quality rendering
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = 'high';

			const img = new Image();
			const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
			const url = URL.createObjectURL(svgBlob);
			
			return new Promise<THREE.Texture | null>((resolve) => {
				img.onload = () => {
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
					URL.revokeObjectURL(url);
					
					const texture = new THREE.CanvasTexture(canvas);
					texture.wrapS = THREE.RepeatWrapping;
					texture.wrapT = THREE.ClampToEdgeWrapping;
					texture.magFilter = THREE.LinearFilter;
					texture.minFilter = THREE.LinearMipmapLinearFilter;
					texture.flipY = false;
					texture.generateMipmaps = true; // Bessere Qualität
					texture.anisotropy = renderer.capabilities.getMaxAnisotropy(); // Maximale anisotrope Filterung
					
					resolve(texture);
				};
				
				img.onerror = () => {
					URL.revokeObjectURL(url);
					resolve(null);
				};
				
				img.src = url;
			});
		} catch (error) {
			console.error("Error creating texture from SVG:", error);
			return null;
		}
	}

	// Instrument filter state
	let instrumentEnabled = {
		accordion: true,
		piano: true,
		violin: true,
	};

	function toggleInstrument(inst: "accordion" | "piano" | "violin") {
		instrumentEnabled[inst] = !instrumentEnabled[inst];
		updatePersistentDotVisibility();
	}

	// Helper to get instrument from depth
	function getInstrumentByDepth(
		depth: number,
	): "accordion" | "piano" | "violin" {
		if (depth > 100) return "accordion";
		if (depth >= 30) return "piano";
		return "violin";
	}

	// Update dot visibility based on instrument filter
	function updatePersistentDotVisibility() {
		for (const dot of persistentDots) {
			const instrument = dot.userData.instrument as 'accordion' | 'piano' | 'violin';
			dot.visible = instrumentEnabled[instrument];
		}
	}

	// Create persistent dots for earthquake epicenters
	function createPersistentDot(
		lat: number,
		lng: number,
		magnitude: number,
		depth: number,
	) {
		const phi = (90 - lat) * (Math.PI / 180);
		const theta = (lng + 180) * (Math.PI / 180);

		// Create small dot geometry
		const dotGeometry = new THREE.SphereGeometry(0.03, 8, 6);

		// Color based on depth and instrument mapping
		const color = getColorForSound(magnitude, depth);

		const dotMaterial = new THREE.MeshBasicMaterial({
			color: color,
			opacity: 0.7,
			transparent: true,
		});

		const dot = new THREE.Mesh(dotGeometry, dotMaterial);

		// Position on outer globe surface (always at 7.05 regardless of depth)
		const outerRadius = 7.05;
		const x = -(Math.sin(phi) * Math.cos(theta) * outerRadius);
		const z = Math.sin(phi) * Math.sin(theta) * outerRadius;
		const y = Math.cos(phi) * outerRadius;

		dot.position.set(x, y, z);

		// Store instrument info for filtering
		dot.userData.instrument = getInstrumentByDepth(depth);

		// Set initial visibility
		dot.visible = instrumentEnabled[dot.userData.instrument as 'accordion' | 'piano' | 'violin'];

		persistentDotsGroup.add(dot);
		persistentDots.push(dot);
	}

	// Animation control
	let animationRequestId: number | null = null;

	function startAnimation() {
		if (animationRequestId !== null) return;

		let startTime: number | null = null;

		const animate = (currentTime: number) => {
			if (startTime === null) startTime = currentTime;

			const elapsed = currentTime - startTime;
			const progress = elapsed / 1000; // Normalize to [0, 1] range

			// Update shockwave animations
			for (const shockwave of earthquakeDots) {
				const userData = shockwave.userData;
				const phase = (progress + userData.magnitude * 0.1) % 1.0; // Offset by magnitude
				userData.material.uniforms.time.value = phase;
			}

			renderer.render(scene, camera);

			if (progress < 1.0) {
				animationRequestId = requestAnimationFrame(animate);
			} else {
				animationRequestId = null;
			}
		};

		animationRequestId = requestAnimationFrame(animate);
	}

	function stopAnimationRequest() {
		if (animationRequestId !== null) {
			cancelAnimationFrame(animationRequestId);
			animationRequestId = null;
		}
	}

	onMount(() => {
		const init = async () => {
			// Initialize Three.js scene
			scene = new THREE.Scene();
			camera = new THREE.PerspectiveCamera(
				75,
				window.innerWidth / window.innerHeight,
				0.1,
				1000,
			);
			renderer = new THREE.WebGLRenderer({ antialias: true });
			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.setClearColor(0x000011);
			container.appendChild(renderer.domElement);

			// Import OrbitControls dynamically
			const { OrbitControls } = await import(
				"three/examples/jsm/controls/OrbitControls.js"
			);
			controls = new OrbitControls(camera, renderer.domElement);
			controls.enableDamping = true;
			controls.dampingFactor = 0.05;
			controls.enableZoom = true;
			controls.minDistance = 12;
			controls.maxDistance = 60;

			// Create the three globe layers with subtle transparency
			
			// Outer globe (shallow earthquakes 0-30km) - completely transparent
			const outerGeometry = new THREE.SphereGeometry(7, 256, 256);
			const outerMaterial = new THREE.MeshBasicMaterial({
				transparent: true,
				opacity: 0.0,
				visible: false, // Keep outer globe invisible
			});
			globe = new THREE.Mesh(outerGeometry, outerMaterial);
			scene.add(globe);

			// Middle globe (medium earthquakes 30-100km) - very subtle red tint
			const middleGeometry = new THREE.SphereGeometry(6, 256, 256);
			const middleMaterial = new THREE.MeshBasicMaterial({
				color: 0xFF4F14, // Red color (swapped from orange)
				transparent: true,
				opacity: 0.03, // Very subtle
				side: THREE.BackSide, // Show from inside
				depthWrite: false,
			});
			const middleGlobe = new THREE.Mesh(middleGeometry, middleMaterial);
			scene.add(middleGlobe);

			// Inner globe (deep earthquakes >100km) - very subtle orange tint
			const innerGeometry = new THREE.SphereGeometry(5, 256, 256);
			const innerMaterial = new THREE.MeshBasicMaterial({
				color: 0xF8AE31, // Orange color (swapped from red)
				transparent: true,
				opacity: 0.04, // Slightly more visible than middle
				side: THREE.BackSide, // Show from inside
				depthWrite: false,
			});
			const innerGlobe = new THREE.Mesh(innerGeometry, innerMaterial);
			scene.add(innerGlobe);

			// Store references for rotation synchronization
			middleGlobeGroup = new THREE.Group();
			middleGlobeGroup.add(middleGlobe);
			scene.add(middleGlobeGroup);

			innerGlobeGroup = new THREE.Group();
			innerGlobeGroup.add(innerGlobe);
			scene.add(innerGlobeGroup);

			// Create country borders overlay
			await createCountryBordersOverlay();

			// Add subtle white latitude/longitude grid lines
			gridGroup = createGridLines();

			// Create group for persistent dots
			persistentDotsGroup = new THREE.Group();
			scene.add(persistentDotsGroup);

			// Create group for shockwaves
			shockwavesGroup = new THREE.Group();
			scene.add(shockwavesGroup);

			// Add lighting
			const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
			scene.add(ambientLight);

			const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
			directionalLight.position.set(1, 1, 1);
			scene.add(directionalLight);

			camera.position.set(0, 0, 20);

			// Animation loop with frame limiting
			const animate = (currentTime: number) => {
				requestAnimationFrame(animate);

				// Frame limiting for better performance
				if (currentTime - lastFrameTime >= frameInterval) {
					// Globe rotation: rotate all globe elements
					if (isGlobeRotating) {
						// Rotate grid lines
						if (gridGroup) {
							gridGroup.rotation.y += globeRotationSpeed;
						}

						// Rotate country borders
						if (countryBordersGroup) {
							countryBordersGroup.rotation.y += globeRotationSpeed;
						}

						// Rotate persistent dots group
						if (persistentDotsGroup) {
							persistentDotsGroup.rotation.y +=
								globeRotationSpeed;
						}

						// Rotate shockwaves group (synchronized with dots and globe)
						if (shockwavesGroup) {
							shockwavesGroup.rotation.y += globeRotationSpeed;
						}

						// Rotate middle and inner globe groups
						if (middleGlobeGroup) {
							middleGlobeGroup.rotation.y += globeRotationSpeed;
						}
						if (innerGlobeGroup) {
							innerGlobeGroup.rotation.y += globeRotationSpeed;
						}
					}

					controls.update();
					updateShockwaves(); // Update shockwave animations
					renderer.render(scene, camera);
					lastFrameTime = currentTime;
				}
			};
			animate(0);

			// Preload earthquake data on startup with date filtering (2010-2016)
			const startDate = new Date("2010-01-01");
			const endDate = new Date("2016-12-30");

			sortedEarthquakeData = [...earthquakeData]
				.filter((quake) => {
					const quakeDate = new Date(quake.Date);
					return quakeDate >= startDate && quakeDate <= endDate;
				})
				.sort((a, b) => {
					const dateA = new Date(a.Date);
					const dateB = new Date(b.Date);
					return dateA.getTime() - dateB.getTime();
				});

			console.log(
				`Loaded ${sortedEarthquakeData.length} earthquakes from 2010-2016`,
			);

			// Preload audio files asynchronously
			preloadAudio();

			// Handle window resize
			const handleResize = () => {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize(window.innerWidth, window.innerHeight);
			};

			window.addEventListener("resize", handleResize);
		};

		init();

		return () => {
			window.removeEventListener("resize", () => {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize(window.innerWidth, window.innerHeight);
			});
			if (container && renderer.domElement) {
				container.removeChild(renderer.domElement);
			}
			controls?.dispose();
			renderer?.dispose();
		};
	});

	// Compute available years from sortedEarthquakeData
	let minYear = 2010;
	let maxYear = 2016;
	$: {
		if (sortedEarthquakeData.length > 0) {
			minYear = new Date(sortedEarthquakeData[0].Date).getFullYear();
			maxYear = new Date(
				sortedEarthquakeData[sortedEarthquakeData.length - 1].Date,
			).getFullYear();
		}
	}
	let selectedYear: number = minYear;

	// Jump to the first earthquake of the selected year
	function jumpToYear(year: number) {
		selectedYear = year;
		currentYear = year;
		// Find the first earthquake of the selected year
		const idx = sortedEarthquakeData.findIndex(
			(q) => new Date(q.Date).getFullYear() === year,
		);
		if (idx !== -1) {
			currentIndex = idx;
			const quake = sortedEarthquakeData[idx];
			// Set the current date to the first earthquake of the year
			if (quake.Date) {
				const date = new Date(quake.Date);
				const day = String(date.getDate()).padStart(2, '0');
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const yearFromDate = date.getFullYear();
				currentDate = `${day}.${month}.${yearFromDate}`;
			}
			clearDots();
			clearPersistentDots();
			// Replay all earthquakes up to this year for persistent dots
			for (let i = 0; i <= idx; i++) {
				const quake = sortedEarthquakeData[i];
				createPersistentDot(
					quake.Latitude,
					quake.Longitude,
					quake.Magnitude,
					quake.Depth,
				);
			}
			updatePersistentDotVisibility();
		}
	}

	// Event handlers für das Control Panel
	function handlePlayToggle() {
		if (isPlaying) {
			stopAnimation();
		} else {
			playAnimation();
		}
	}

	function handleRotationToggle() {
		isGlobeRotating = !isGlobeRotating;
	}

	function handleMapToggle() {
		isMapVisible = !isMapVisible;
		if (countryBordersGroup) {
			countryBordersGroup.visible = isMapVisible;
		}
	}

	function handleClearDots() {
		clearPersistentDots();
	}

	function handleSpeedChange(event: CustomEvent<number>) {
		animationSpeed = event.detail;
	}

	function handleInstrumentToggle(event: CustomEvent<'accordion' | 'piano' | 'violin'>) {
		toggleInstrument(event.detail);
	}

	function handleYearChange(event: CustomEvent<number>) {
		jumpToYear(event.detail);
	}

	// Event handlers für neue Instrument-Toggles
	function handleAlternativeInstrumentToggle(event: CustomEvent<{type: 'deep' | 'medium' | 'shallow' | 'catastrophic'}>) {
		const { type } = event.detail;
		useAlternativeInstruments[type] = !useAlternativeInstruments[type];
	}

	function handleMapToggleEvent() {
		handleMapToggle();
	}
</script>

<div class="container">
	<div bind:this={container} class="visualisation-container"></div>

	<!-- Subtiles Datum-Overlay -->
	{#if currentDate && (isPlaying || hasPlayed)}
		<div class="date-overlay">
			{currentDate}
		</div>
	{/if}

	<!-- Zentraler Play-Button am unteren Bildschirmrand -->
	<button 
		class="main-play-button"
		class:playing={isPlaying}
		on:click={handlePlayToggle}
		aria-label={isPlaying ? 'Stop Sonification' : 'Play Sonification'}
	>
		<div class="play-icon">
			{#if isPlaying}
				<div class="pause-bars">
					<span></span>
					<span></span>
				</div>
			{:else}
				<div class="play-triangle"></div>
			{/if}
		</div>
		<span class="play-text">{isPlaying ? "Stop" : "Play"}</span>
	</button>

	<ControlPanel
		{isPlaying}
		{isGlobeRotating}
		{isMapVisible}
		{animationSpeed}
		{instrumentEnabled}
		{useAlternativeInstruments}
		{currentYear}
		{hasPlayed}
		{minYear}
		{maxYear}
		{selectedYear}
		on:playToggle={handlePlayToggle}
		on:rotationToggle={handleRotationToggle}
		on:mapToggle={handleMapToggleEvent}
		on:clearDots={handleClearDots}
		on:speedChange={handleSpeedChange}
		on:instrumentToggle={handleInstrumentToggle}
		on:yearChange={handleYearChange}
		on:alternativeInstrumentToggle={handleAlternativeInstrumentToggle}
	/>
</div>

<style>
	.container {
		position: relative;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		background: #000011;
		color: white;
	}

	.visualisation-container {
		width: 100%;
		height: 100%;
	}

	/* Subtiles Datum-Overlay */
	.date-overlay {
		position: fixed;
		top: 30px;
		right: 30px;
		z-index: 100;
		font-family: "IBM Plex Mono", monospace;
		font-size: 14px;
		color: rgba(255, 255, 255, 0.6);
		background: rgba(0, 0, 17, 0.3);
		backdrop-filter: blur(10px);
		padding: 8px 12px;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: all 0.3s ease;
		pointer-events: none;
	}

	.date-overlay:hover {
		color: rgba(255, 255, 255, 0.8);
		background: rgba(0, 0, 17, 0.5);
	}

	/* Zentraler Play-Button */
	.main-play-button {
		position: fixed;
		bottom: 30px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 200;
		width: 52px;
		height: 52px;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		transition: all 0.2s ease;
		font-family: "IBM Plex Sans", sans-serif;
	}

	.main-play-button:hover {
		border-color: rgba(255, 255, 255, 0.4);
		background: rgba(255, 255, 255, 0.02);
	}

	.main-play-button.playing {
		border-color: rgba(255, 255, 255, 0.4);
		background: rgba(255, 255, 255, 0.05);
	}

	.play-icon {
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.play-triangle {
		width: 0;
		height: 0;
		border-left: 9px solid rgba(255, 255, 255, 0.8);
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		margin-left: 1px;
	}

	.pause-bars {
		display: flex;
		gap: 3px;
	}

	.pause-bars span {
		width: 3px;
		height: 12px;
		background: rgba(255, 255, 255, 0.8);
		border-radius: 1px;
	}

	.play-text {
		font-size: 9px;
		font-weight: 400;
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.date-overlay {
			top: 20px;
			right: 20px;
			font-size: 12px;
			padding: 6px 10px;
		}

		.main-play-button {
			width: 44px;
			height: 44px;
			bottom: 20px;
		}

		.play-icon {
			width: 14px;
			height: 14px;
		}

		.play-triangle {
			border-left-width: 7px;
			border-top-width: 5px;
			border-bottom-width: 5px;
		}

		.pause-bars span {
			width: 2px;
			height: 10px;
		}

		.play-text {
			font-size: 8px;
		}
	}
</style>
