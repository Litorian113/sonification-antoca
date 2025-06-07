<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import earthquakeData from '../../data/earthquakeDATA.json';

	let container: HTMLElement;
	let isPlaying = false;
	let currentIndex = 0;
	let animationSpeed = 50; // milliseconds between earthquakes
	let globe: THREE.Mesh;
	let scene: THREE.Scene;
	let camera: THREE.PerspectiveCamera;
	let renderer: THREE.WebGLRenderer;
	let controls: any;
	let earthquakeDots: THREE.Mesh[] = [];
	let persistentDots: THREE.Mesh[] = []; // For persistent earthquake points
	let audioContext: AudioContext;
	let playButton: HTMLButtonElement;
	
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
	const frameInterval = 1000 / targetFPS;	// Sound mapping: Depth determines instrument, Magnitude determines pitch within instrument
	const getSoundFiles = (magnitude: number, depth: number): string[] => {
		const sounds: string[] = [];
		
		// Determine instrument based on depth (adjusted ranges for better distribution)
		if (depth > 80) {
			// High depth: Double Bass (deeper earthquakes) - use more recognizable pitches
			if (magnitude >= 6.5) {
				// High magnitude = lowest pitch (but not too low to be inaudible)
				sounds.push('/double-bass/F0.wav');
			} else if (magnitude >= 5.5) {
				// Medium magnitude = medium pitch  
				sounds.push('/double-bass/A1.wav');
			} else {
				// Low magnitude = highest pitch
				sounds.push('/double-bass/G2.wav');
			}
		} else if (depth > 20) {
			// Medium depth: Piano (medium earthquakes)
			if (magnitude >= 6.5) {
				// High magnitude = lowest pitch
				sounds.push('/piano/C1.wav');
			} else if (magnitude >= 5.5) {
				// Medium magnitude = medium pitch
				sounds.push('/piano/E2.wav');
			} else {
				// Low magnitude = highest pitch
				sounds.push('/piano/G4.wav');
			}
		} else {
			// Low depth: Theremin (shallow earthquakes)
			if (magnitude >= 6.5) {
				// High magnitude = lowest pitch
				sounds.push('/theremin/F2.wav');
			} else if (magnitude >= 5.5) {
				// Medium magnitude = medium pitch
				sounds.push('/theremin/A3.wav');
			} else {
				// Low magnitude = highest pitch
				sounds.push('/theremin/G4.wav');
			}
		}

		return sounds;
	};
	// Preload all audio files
	const preloadAudio = async () => {
		if (isAudioPreloaded) return;
		
		try {
			if (!audioContext) {
				audioContext = new AudioContext();
			}
					const audioFiles = [
				// Piano sounds
				'/piano/C1.wav', '/piano/C2.wav', '/piano/C3.wav',
				'/piano/E1.wav', '/piano/E2.wav', '/piano/E4.wav', 
				'/piano/G1.wav', '/piano/G2.wav', '/piano/G4.wav',
				// Theremin sounds
				'/theremin/F2.wav', '/theremin/A3.wav', '/theremin/G4.wav',
				// Choir sounds (commented out)
				// '/choir/B2.wav', '/choir/F4.wav', '/choir/G5.wav',
				// Double bass sounds
				'/double-bass/A1.wav', '/double-bass/F0.wav', '/double-bass/G2.wav'
			];
			
			const loadPromises = audioFiles.map(async (file) => {
				try {
					const response = await fetch(file);
					const arrayBuffer = await response.arrayBuffer();
					const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
					audioBuffers.set(file, audioBuffer);
				} catch (error) {
					console.warn(`Failed to load audio file: ${file}`, error);
				}
			});
			
			await Promise.all(loadPromises);
			isAudioPreloaded = true;
			console.log('Audio preloading completed');
		} catch (error) {
			console.error('Audio preloading failed:', error);
		}
	};
	const playSound = async (soundFile: string) => {
		try {
			if (!audioContext) {
				audioContext = new AudioContext();
			}
			
			// Use preloaded buffer if available
			const audioBuffer = audioBuffers.get(soundFile);
			if (audioBuffer) {
				const source = audioContext.createBufferSource();
				source.buffer = audioBuffer;
				source.connect(audioContext.destination);
				source.start();
				return;
			}
			
			// Fallback to dynamic loading
			const response = await fetch(soundFile);
			const arrayBuffer = await response.arrayBuffer();
			const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
			
			const source = audioContext.createBufferSource();
			source.buffer = decodedBuffer;
			source.connect(audioContext.destination);
			source.start();
		} catch (error) {
			console.error('Error playing sound:', error);
		}
	};
	const playSounds = async (soundFiles: string[]) => {
		// Play sounds one at a time to avoid overlapping interference
		// For earthquake sonification, we want clear, distinct sounds rather than layered ones
		if (soundFiles.length > 0) {
			// Just play the first (main) sound to avoid audio glitching
			playSound(soundFiles[0]);
		}
	};

	const createShockwave = (magnitude: number) => {
		// Reuse shared geometry for better performance
		if (!sharedShockwaveGeometry) {
			sharedShockwaveGeometry = new THREE.SphereGeometry(7.02, 64, 32, 0, Math.PI * 2, 0, Math.PI);
		}
		
		// Color based on magnitude in turquoise spectrum
		let color;
		if (magnitude > 6.2) {
			color = new THREE.Color(0x00ffff); // Bright cyan for high magnitude
		} else if (magnitude >= 4.1) {
			color = new THREE.Color(0x40e0d0); // Turquoise for medium magnitude
		} else {
			color = new THREE.Color(0x64ffda); // Light turquoise for low magnitude
		}
		
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
					float ringWidth = maxRadius * 0.04; // Much thinner rings
					
					float ringDistance = abs(sphericalDistance - ringRadius);
					float alpha = 1.0 - (ringDistance / ringWidth);
					alpha = clamp(alpha, 0.0, 1.0);
					
					// Faster fade out for subtler effect
					alpha *= (1.0 - time * 0.9);
					
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
				maxRadius: { value: magnitude > 6.2 ? 1.8 : magnitude >= 4.1 ? 1.4 : 1.0 },
				color: { value: color },
				epicenter: { value: new THREE.Vector3(0, 0, 0) },
				globeRadius: { value: 7.0 }
			},
			transparent: true,
			side: THREE.DoubleSide,
			depthWrite: false,
			blending: THREE.AdditiveBlending
		});
		
		const shockwave = new THREE.Mesh(sharedShockwaveGeometry, shaderMaterial);
		
		// Store animation properties
		shockwave.userData = {
			magnitude,
			startTime: Date.now(),
			duration: 2000 + (magnitude * 100), // Shorter duration for quicker fade
			material: shaderMaterial
		};
		
		return shockwave;
	};

	const addEarthquakeShockwave = (quake: any) => {
		const lat = quake.Latitude;
		const lon = quake.Longitude;
		const magnitude = quake.Magnitude;

		// Convert lat/lon to 3D coordinates on sphere surface
		const phi = (90 - lat) * (Math.PI / 180);
		const theta = (lon + 180) * (Math.PI / 180);
		const radius = 7.0; // Larger globe radius

		const x = -(radius * Math.sin(phi) * Math.cos(theta));
		const z = (radius * Math.sin(phi) * Math.sin(theta));
		const y = (radius * Math.cos(phi));

		const epicenterPosition = new THREE.Vector3(x, y, z);
		const shockwave = createShockwave(magnitude);
		
		// Set the epicenter position in the shader
		shockwave.userData.material.uniforms.epicenter.value = epicenterPosition.clone().normalize().multiplyScalar(7.0);
		
		// Position the shockwave at the globe center (the shader will handle the positioning)
		shockwave.position.set(0, 0, 0);
		
		scene.add(shockwave);
		earthquakeDots.push(shockwave);
		// Create persistent dot at earthquake epicenter
		createPersistentDot(lat, lon, magnitude);

		// Play sounds (multiple instruments)
		const soundFiles = getSoundFiles(magnitude, quake.Depth);
		playSounds(soundFiles);
	};

	const clearDots = () => {
		earthquakeDots.forEach(shockwave => {
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
		persistentDots.forEach(dot => {
			scene.remove(dot);
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

	const playAnimation = async () => {
		if (isPlaying) return;
		
		isPlaying = true;
		currentIndex = 0;
		clearDots();
		// Keep persistent dots - don't clear them when starting new animation

		// Use pre-sorted data for better performance
		const playNext = () => {
			if (!isPlaying || currentIndex >= sortedEarthquakeData.length) {
				isPlaying = false;
				return;
			}

			addEarthquakeShockwave(sortedEarthquakeData[currentIndex]);
			currentIndex++;

			setTimeout(playNext, animationSpeed);
		};

		playNext();
	};

	const stopAnimation = () => {
		isPlaying = false;
	};

	// Create grid lines for latitude and longitude
	function createGridLines() {
		const gridGroup = new THREE.Group();
		
		// Create material for grid lines
		const gridMaterial = new THREE.LineBasicMaterial({ 
			color: 0xffffff, 
			opacity: 0.15, 
			transparent: true 
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
	}

	// Create persistent dots for earthquake epicenters
	function createPersistentDot(lat: number, lng: number, magnitude: number) {
		const phi = (90 - lat) * (Math.PI / 180);
		const theta = (lng + 180) * (Math.PI / 180);
		
		// Create small dot geometry
		const dotGeometry = new THREE.SphereGeometry(0.03, 8, 6);
		
		// Color based on magnitude (same as shockwaves)
		let color;
		if (magnitude >= 6.2) {
			color = 0x00ffff; // Cyan for high magnitude
		} else if (magnitude >= 4.1) {
			color = 0x40e0d0; // Turquoise for medium magnitude
		} else {
			color = 0x64ffda; // Light turquoise for low magnitude
		}
		
		const dotMaterial = new THREE.MeshBasicMaterial({ 
			color: color,
			opacity: 0.7,
			transparent: true
		});
		
		const dot = new THREE.Mesh(dotGeometry, dotMaterial);
		
		// Position on globe surface (slightly above for visibility)
		const x = -(Math.sin(phi) * Math.cos(theta) * 7.05);
		const z = (Math.sin(phi) * Math.sin(theta) * 7.05);
		const y = (Math.cos(phi) * 7.05);
		
		dot.position.set(x, y, z);
		scene.add(dot);
		persistentDots.push(dot);
	}

	onMount(() => {
		const init = async () => {
			// Initialize Three.js scene
			scene = new THREE.Scene();
			camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
			renderer = new THREE.WebGLRenderer({ antialias: true });
			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.setClearColor(0x000011);
			container.appendChild(renderer.domElement);

			// Import OrbitControls dynamically
			const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
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
				visible: false  // Make globe completely invisible
			});
			
			globe = new THREE.Mesh(geometry, material);
			scene.add(globe);

			// Add subtle white latitude/longitude grid lines
			createGridLines();

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
					controls.update();
					updateShockwaves(); // Update shockwave animations
					renderer.render(scene, camera);
					lastFrameTime = currentTime;
				}
			};
			animate(0);
			
			// Preload earthquake data on startup
			sortedEarthquakeData = [...earthquakeData].sort((a, b) => {
				const dateA = new Date(a.Date);
				const dateB = new Date(b.Date);
				return dateA.getTime() - dateB.getTime();
			});
			
			// Preload audio files asynchronously
			preloadAudio();

			// Handle window resize
			const handleResize = () => {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize(window.innerWidth, window.innerHeight);
			};
			
			window.addEventListener('resize', handleResize);
		};

		init();

		return () => {
			window.removeEventListener('resize', () => {
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
			{isPlaying ? 'Stop' : 'Play Sonification'}
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
				disabled={isPlaying}
			>
			<span>{animationSpeed}ms</span>
		</div>
				<div class="info">
			<div class="legend">				<h4>Depth → Instrument Mapping:</h4>
				<div class="legend-item">
					<div class="color-dot cyan"></div>
					<span>>80m: Double Bass</span>
				</div>
				<div class="legend-item">
					<div class="color-dot turquoise"></div>
					<span>20-80m: Piano</span>
				</div>
				<div class="legend-item">
					<div class="color-dot light-turquoise"></div>
					<span>&lt;20m: Theremin</span>
				</div>
				
				<h4>Magnitude → Pitch (within instrument):</h4>
				<div class="legend-item">
					<span>≥6.5: Lowest pitch (F0/C1/F2)</span>
				</div>
				<div class="legend-item">
					<span>5.5-6.5: Medium pitch (A1/E2/A3)</span>
				</div>
				<div class="legend-item">
					<span>&lt;5.5: Highest pitch (G2/G4/G4)</span>
				</div>
			</div>
		</div>
	</div>
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
		background: linear-gradient(135deg, rgba(10, 10, 10, 0.95), rgba(26, 26, 46, 0.9));
		padding: 30px;
		border-radius: 20px;
		backdrop-filter: blur(15px);
		border: none;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 
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
		font-family: 'IBM Plex Sans', sans-serif;
		animation: gradientShift 3s ease-in-out infinite;
	}

	.play-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
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
		font-family: 'IBM Plex Sans', sans-serif;
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
		0%, 100% {
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
		font-family: 'IBM Plex Sans', sans-serif;
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
		font-family: 'IBM Plex Sans', sans-serif;
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

	.color-dot.cyan {
		background: linear-gradient(45deg, #00ffff, #40ffff);
		box-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
	}

	.color-dot.turquoise {
		background: linear-gradient(45deg, #40e0d0, #64ffda);
		box-shadow: 0 0 10px rgba(64, 224, 208, 0.6);
	}

	.color-dot.light-turquoise {
		background: linear-gradient(45deg, #64ffda, #a0ffff);
		box-shadow: 0 0 10px rgba(100, 255, 218, 0.6);
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
	}
</style>
