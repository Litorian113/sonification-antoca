<script lang="ts">
	import { onMount } from "svelte";
	import * as THREE from "three";
	import earthquakeData from "../../data/earthquakeDATA.json";

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
	let globeRotationSpeed = 0.01; // Rotation speed for globes
	let isGlobeRotating = true; // Enable/disable globe rotation
	let gridGroup: THREE.Group; // Reference to the grid lines
	let persistentDotsGroup: THREE.Group; // Reference to persistent dots group

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

	// New Sound mapping: Depth determines instrument, Magnitude determines pitch and volume
	const getSoundFile = (magnitude: number, depth: number): string => {
		if (depth > 100) {
			// Depth > 100: Accordion (RED) - 6 tones between 5.0-7.9
			if (magnitude >= 7.5) return "/accordion/g2.wav";
			else if (magnitude >= 7.0) return "/accordion/f2.wav";
			else if (magnitude >= 6.5) return "/accordion/e2.wav";
			else if (magnitude >= 6.0) return "/accordion/d2.wav";
			else if (magnitude >= 5.5) return "/accordion/c2.wav";
			else if (magnitude >= 5.0) return "/accordion/b2.wav";
			else return "/accordion/a2.wav"; // fallback for < 5.0
		} else if (depth >= 30) {
			// Depth 30-100: Piano (YELLOW) - 6 tones between 5.0-7.9
			if (magnitude >= 7.5) return "/piano/C1.wav";
			else if (magnitude >= 7.0) return "/piano/E1.wav";
			else if (magnitude >= 6.5) return "/piano/G1.wav";
			else if (magnitude >= 6.0) return "/piano/C2.wav";
			else if (magnitude >= 5.5) return "/piano/E2.wav";
			else if (magnitude >= 5.0) return "/piano/C3.wav";
			else return "/piano/G4.wav"; // fallback for < 5.0
		} else {
			// Depth 0-30: Violin (BLUE) - 6 tones between 5.0-7.9
			if (magnitude >= 7.5) return "/violin/g3.wav";
			else if (magnitude >= 7.0) return "/violin/c4.wav";
			else if (magnitude >= 6.5) return "/violin/e4.wav";
			else if (magnitude >= 6.0) return "/violin/g4.wav";
			else if (magnitude >= 5.5) return "/violin/a5.wav";
			else if (magnitude >= 5.0) return "/violin/a6.wav";
			else return "/violin/a6.wav"; // fallback for < 5.0
		}
	};

	// Calculate volume based on magnitude (0.1 to 1.0)
	const getVolumeForMagnitude = (
		magnitude: number,
		depth: number,
	): number => {
		// Return constant volume for all earthquakes
		return 0.7;
	};

	// Get percussion sound for magnitude 8+ events
	const getPercussionSound = (): string => {
		return "/percussion/b5.wav";
	};

	// Color mapping based on new depth ranges and instruments
	const getColorForSound = (
		magnitude: number,
		depth: number,
	): THREE.Color => {
		// Special color for magnitude 8+ events (catastrophic earthquakes)
		if (magnitude >= 8.0) {
			return new THREE.Color(0x00ff44); // Bright green for catastrophic events
		}

		if (depth > 100) {
			// Depth > 100: Accordion - RED
			return new THREE.Color(0xff4444);
		} else if (depth >= 30) {
			// Depth 30-100: Piano - YELLOW
			return new THREE.Color(0xffff44);
		} else {
			// Depth 0-30: Violin - BLUE
			return new THREE.Color(0x4444ff);
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
			}
			const audioFiles = [
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
			64,
			32,
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
			64,
			32,
			0,
			Math.PI * 2,
			0,
			Math.PI,
		);

		// Bright green color for catastrophic events
		const greenColor = new THREE.Color(0x00ff44);

		// Impact radius for catastrophic events - smaller than before
		const maxRadius = 2.2; // Reasonable size for magnitude 8+ events
		const ringWidth = 0.08; // Slightly thinner ring
		const duration = 4000; // Shorter duration (4 seconds)

		// Create shader material for green catastrophic shockwave
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
				color: { value: greenColor },
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

		scene.add(shockwave);
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

			// Create additional green shockwave on outer globe for visual impact
			const greenShockwave = createCatastrophicShockwave(
				magnitude,
				lat,
				lon,
			);
			greenShockwave.position.set(0, 0, 0);
			scene.add(greenShockwave);
			earthquakeDots.push(greenShockwave);
		}
	};

	const clearDots = () => {
		earthquakeDots.forEach((shockwave) => {
			scene.remove(shockwave);
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
				scene.remove(shockwave);
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

			// Set currentYear from quake.Date
			if (quake.Date) {
				const year = new Date(quake.Date).getFullYear();
				if (!isNaN(year)) {
					currentYear = year;
					selectedYear = year; // <-- Add this line to sync the slider
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

	// Create grid lines for latitude and longitude
	function createGridLines() {
		const gridGroup = new THREE.Group();

		// Create material for grid lines
		const gridMaterial = new THREE.LineBasicMaterial({
			color: 0xffffff,
			opacity: 0.15,
			transparent: true,
		});

		// Latitude lines (horizontal circles)
		for (let lat = -80; lat <= 80; lat += 20) {
			const phi = (90 - lat) * (Math.PI / 180);
			const geometry = new THREE.BufferGeometry();
			const points = [];

			for (let i = 0; i <= 64; i++) {
				const theta = (i / 64) * Math.PI * 2;
				const x = Math.sin(phi) * Math.cos(theta) * 7.0;
				const y = Math.cos(phi) * 7.0;
				const z = Math.sin(phi) * Math.sin(theta) * 7.0;
				points.push(new THREE.Vector3(x, y, z));
			}

			geometry.setFromPoints(points);
			const line = new THREE.Line(geometry, gridMaterial);
			gridGroup.add(line);
		}

		// Longitude lines (vertical semicircles)
		for (let lng = -180; lng < 180; lng += 30) {
			const geometry = new THREE.BufferGeometry();
			const points = [];

			for (let i = 0; i <= 32; i++) {
				const phi = (i / 32) * Math.PI;
				const theta = lng * (Math.PI / 180);
				const x = Math.sin(phi) * Math.cos(theta) * 7.0;
				const y = Math.cos(phi) * 7.0;
				const z = Math.sin(phi) * Math.sin(theta) * 7.0;
				points.push(new THREE.Vector3(x, y, z));
			}

			geometry.setFromPoints(points);
			const line = new THREE.Line(geometry, gridMaterial);
			gridGroup.add(line);
		}

		scene.add(gridGroup);
		return gridGroup; // Return reference for rotation
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
			const instrument = dot.userData.instrument;
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
		dot.visible = instrumentEnabled[dot.userData.instrument];

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

			// Create Earth globe with higher resolution
			const geometry = new THREE.SphereGeometry(7, 128, 128);

			// Create a completely transparent Earth material (invisible globe)
			const material = new THREE.MeshBasicMaterial({
				transparent: true,
				opacity: 0.0,
				visible: false, // Make globe completely invisible
			});

			globe = new THREE.Mesh(geometry, material);
			scene.add(globe);

			// Add subtle white latitude/longitude grid lines
			gridGroup = createGridLines();

			// Create group for persistent dots
			persistentDotsGroup = new THREE.Group();
			scene.add(persistentDotsGroup);

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

						// Rotate persistent dots group
						if (persistentDotsGroup) {
							persistentDotsGroup.rotation.y +=
								globeRotationSpeed;
						}

						// Rotate all shockwaves
						earthquakeDots.forEach((shockwave) => {
							shockwave.rotateOnWorldAxis(
								new THREE.Vector3(0, 1, 0),
								globeRotationSpeed,
							);
						});
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
</script>

<div class="container">
	<div bind:this={container} class="visualisation-container"></div>

	<div class="controls">
		<button
			bind:this={playButton}
			class="play-btn"
			class:playing={isPlaying}
			on:click={isPlaying ? stopAnimation : playAnimation}
		>
			{isPlaying ? "Stop" : "Play Sonification"}
		</button>

		<button
			class="rotation-btn"
			on:click={() => (isGlobeRotating = !isGlobeRotating)}
		>
			{isGlobeRotating ? "Stop Globe Rotation" : "Start Globe Rotation"}
		</button>

		<button
			class="clear-btn"
			on:click={clearPersistentDots}
			disabled={isPlaying}
		>
			Clear Epicenter Dots
		</button>

		<div class="speed-control">
			<label for="speed">Animation Speed:</label>
			<input
				type="range"
				id="speed"
				min="10"
				max="500"
				bind:value={animationSpeed}
			/>
			<span>{animationSpeed}ms</span>
		</div>
		<div class="info">
			<div class="legend">
				<h4>3D Depth Visualization:</h4>
				<div
					class="legend-item clickable {instrumentEnabled.accordion
						? ''
						: 'disabled'}"
					on:click={() => toggleInstrument("accordion")}
				>
					<div class="color-dot red"></div>
					<span
						>>100m: Inner Globe (Red) - Accordion {instrumentEnabled.accordion
							? ""
							: "(Muted)"}</span
					>
				</div>
				<div
					class="legend-item clickable {instrumentEnabled.piano
						? ''
						: 'disabled'}"
					on:click={() => toggleInstrument("piano")}
				>
					<div class="color-dot yellow"></div>
					<span
						>30-100m: Middle Globe (Yellow) - Piano {instrumentEnabled.piano
							? ""
							: "(Muted)"}</span
					>
				</div>
				<div
					class="legend-item clickable {instrumentEnabled.violin
						? ''
						: 'disabled'}"
					on:click={() => toggleInstrument("violin")}
				>
					<div class="color-dot blue"></div>
					<span
						>0-30m: Outer Globe (Blue) - Violin {instrumentEnabled.violin
							? ""
							: "(Muted)"}</span
					>
				</div>

				<h4>Visual Elements:</h4>
				<div class="legend-item">
					<span>• Dots: All shown on surface</span>
				</div>
				<div class="legend-item">
					<span>• Rings: Spread at actual depth layer</span>
				</div>

				<h4>Magnitude → Pitch & Volume:</h4>
				<div class="legend-item">
					<span>Higher magnitude = Lower pitch + Louder</span>
				</div>
				<div class="legend-item">
					<span>Lower magnitude = Higher pitch + Quieter</span>
				</div>

				<h4>Data Range:</h4>
				<div class="legend-item">
					<span>2010 - 2016 Earthquakes</span>
				</div>
			</div>
		</div>
	</div>

	{#if (isPlaying && currentYear) || (!isPlaying && hasPlayed && currentYear)}
		<div class="year-counter">
			<span class="year-value">{currentYear}</span>
			<!-- Year slider and input -->
			<div class="year-slider-row">
				<input
					type="range"
					min={minYear}
					max={maxYear}
					bind:value={selectedYear}
					on:input={() => jumpToYear(selectedYear)}
					class="year-slider"
				/>
			</div>
		</div>
	{/if}
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

	.controls {
		position: absolute;
		top: 20px;
		left: 20px;
		z-index: 100;
		display: flex;
		flex-direction: column;
		gap: 24px;
		background: linear-gradient(
			135deg,
			rgba(10, 10, 10, 0.95),
			rgba(26, 26, 46, 0.9)
		);
		padding: 30px;
		border-radius: 20px;
		backdrop-filter: blur(15px);
		border: none;
		box-shadow:
			0 20px 40px rgba(0, 0, 0, 0.5),
			0 0 20px rgba(100, 255, 218, 0.1);
		min-width: 280px;
	}

	.play-btn {
		padding: 16px 32px;
		font-size: 16px;
		background: linear-gradient(135deg, #64ffda, #00bcd4, #009688);
		background-size: 200% 200%;
		color: #000;
		border: none;
		border-radius: 30px;
		cursor: pointer;
		font-weight: 700;
		transition: all 0.4s ease;
		text-transform: uppercase;
		letter-spacing: 1.5px;
		position: relative;
		overflow: hidden;
		font-family: "IBM Plex Sans", sans-serif;
		animation: gradientShift 3s ease-in-out infinite;
	}

	.play-btn::before {
		content: "";
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.2),
			transparent
		);
		transition: left 0.5s;
	}

	.play-btn:hover::before {
		left: 100%;
	}

	.play-btn:hover {
		transform: translateY(-3px);
		box-shadow: 0 15px 35px rgba(100, 255, 218, 0.4);
	}

	.play-btn.playing {
		background: linear-gradient(135deg, #ff6b6b, #ff8e53, #ffa726);
		background-size: 200% 200%;
		animation: gradientShift 2s ease-in-out infinite;
	}

	.rotation-btn {
		padding: 12px 24px;
		font-size: 14px;
		background: linear-gradient(135deg, #4caf50, #45a049, #66bb6a);
		background-size: 200% 200%;
		color: white;
		border: none;
		border-radius: 25px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s ease;
		text-transform: uppercase;
		letter-spacing: 1px;
		font-family: "IBM Plex Sans", sans-serif;
	}

	.rotation-btn:hover {
		background: linear-gradient(135deg, #45a049, #4caf50);
		transform: translateY(-2px);
		box-shadow: 0 10px 25px rgba(76, 175, 80, 0.3);
	}

	.clear-btn {
		padding: 12px 24px;
		font-size: 14px;
		background: linear-gradient(135deg, #666, #888, #999);
		background-size: 200% 200%;
		color: white;
		border: none;
		border-radius: 25px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s ease;
		text-transform: uppercase;
		letter-spacing: 1px;
		font-family: "IBM Plex Sans", sans-serif;
	}

	.clear-btn:hover:not(:disabled) {
		background: linear-gradient(135deg, #ff6b6b, #ff8e53);
		transform: translateY(-2px);
		box-shadow: 0 10px 25px rgba(255, 107, 107, 0.3);
	}

	.clear-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	@keyframes gradientShift {
		0%,
		100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}

	.speed-control {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 20px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 15px;
		border: 1px solid rgba(100, 255, 218, 0.2);
	}

	.speed-control label {
		font-size: 14px;
		font-weight: 600;
		color: #64ffda;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-family: "IBM Plex Sans", sans-serif;
	}

	.speed-control input[type="range"] {
		width: 220px;
		height: 6px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
		outline: none;
		-webkit-appearance: none;
		appearance: none;
	}
	.speed-control input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 18px;
		height: 18px;
		background: linear-gradient(45deg, #64ffda, #00bcd4);
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 0 10px rgba(100, 255, 218, 0.5);
	}

	.speed-control input[type="range"]::-moz-range-thumb {
		width: 18px;
		height: 18px;
		background: linear-gradient(45deg, #64ffda, #00bcd4);
		border-radius: 50%;
		cursor: pointer;
		border: none;
		box-shadow: 0 0 10px rgba(100, 255, 218, 0.5);
	}

	.speed-control span {
		font-size: 13px;
		color: #64ffda;
		font-weight: 600;
		text-align: center;
		background: rgba(100, 255, 218, 0.1);
		padding: 4px 12px;
		border-radius: 20px;
		border: 1px solid rgba(100, 255, 218, 0.3);
	}

	.info {
		max-width: 280px;
		background: rgba(255, 255, 255, 0.03);
		padding: 20px;
		border-radius: 15px;
		border: 1px solid rgba(100, 255, 218, 0.1);
	}

	.legend h4 {
		margin: 0 0 15px 0;
		color: #64ffda;
		font-size: 15px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
		font-family: "IBM Plex Sans", sans-serif;
		border-bottom: 2px solid rgba(100, 255, 218, 0.3);
		padding-bottom: 8px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 10px;
		font-size: 13px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.9);
		padding: 8px 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}

	.legend-item:last-child {
		border-bottom: none;
	}

	.color-dot {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
		border: 2px solid rgba(255, 255, 255, 0.2);
	}

	.color-dot.red {
		background: linear-gradient(45deg, #ff4444, #ff6666);
		box-shadow: 0 0 10px rgba(255, 68, 68, 0.6);
	}

	.color-dot.yellow {
		background: linear-gradient(45deg, #ffff44, #ffff66);
		box-shadow: 0 0 10px rgba(255, 255, 68, 0.6);
	}

	.color-dot.blue {
		background: linear-gradient(45deg, #4444ff, #6666ff);
		box-shadow: 0 0 10px rgba(68, 68, 255, 0.6);
	}

	.year-counter {
		position: fixed;
		right: 40px;
		bottom: 40px;
		z-index: 200;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 15px;
		border: 1.5px solid rgba(100, 255, 218, 0.25);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
		padding: 18px 38px 14px 38px;
		min-width: 100px;
		transition: opacity 0.3s;
	}

	.year-value {
		font-size: 2rem;
		font-weight: 600;
		color: #64ffda;
		letter-spacing: 0.08em;
		font-family: "IBM Plex Sans", sans-serif;
		line-height: 1;
	}

	.year-slider-row {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-top: 14px;
	}

	.year-slider {
		width: 220px;
		height: 6px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
		outline: none;
		-webkit-appearance: none;
		appearance: none;
	}
	.year-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 18px;
		height: 18px;
		background: linear-gradient(45deg, #64ffda, #00bcd4);
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 0 10px rgba(100, 255, 218, 0.5);
	}
	.year-slider::-moz-range-thumb {
		width: 18px;
		height: 18px;
		background: linear-gradient(45deg, #64ffda, #00bcd4);
		border-radius: 50%;
		cursor: pointer;
		border: none;
		box-shadow: 0 0 10px rgba(100, 255, 218, 0.5);
	}
	.year-slider:focus {
		outline: none;
	}

	@media (max-width: 768px) {
		.controls {
			top: 10px;
			left: 10px;
			padding: 20px;
			max-width: calc(100vw - 40px);
			min-width: auto;
		}

		.speed-control input[type="range"] {
			width: 180px;
		}

		.info {
			max-width: 100%;
		}

		.year-counter {
			right: 10px;
			bottom: 10px;
			padding: 10px 16px 8px 16px;
			min-width: 60px;
		}
		.year-value {
			font-size: 1.2rem;
		}
	}

	.legend-item.clickable {
		cursor: pointer;
		transition:
			background 0.2s,
			opacity 0.2s;
	}
	.legend-item.clickable:hover {
		background: rgba(100, 255, 218, 0.08);
	}
	.legend-item.disabled {
		opacity: 0.4;
		text-decoration: line-through;
	}
</style>
