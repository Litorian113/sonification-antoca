<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import earthquakeData from '../../data/earthquakeDATA.json';

	let container: HTMLElement;

	onMount(() => {
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		const renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);

		// Create a sphere geometry for the globe
		const geometry = new THREE.SphereGeometry(5, 32, 32);
		const material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, wireframe: true }); // Simple material for now
		const globe = new THREE.Mesh(geometry, material);
		scene.add(globe);

		// Add earthquake dots
		const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
		const dotGeometry = new THREE.SphereGeometry(0.05, 8, 8); // Small dots

		earthquakeData.forEach(quake => {
			const lat = quake.Latitude;
			const lon = quake.Longitude;

			// Convert lat/lon to 3D coordinates
			const phi = (90 - lat) * (Math.PI / 180);
			const theta = (lon + 180) * (Math.PI / 180);

			const x = -(5 * Math.sin(phi) * Math.cos(theta));
			const z = (5 * Math.sin(phi) * Math.sin(theta));
			const y = (5 * Math.cos(phi));

			const dot = new THREE.Mesh(dotGeometry, dotMaterial);
			dot.position.set(x, y, z);
			globe.add(dot); // Add dots as children of the globe to rotate with it
		});

		camera.position.z = 15;

		function animate() {
			requestAnimationFrame(animate);

			// Auto-rotation
			globe.rotation.y += 0.005;

			renderer.render(scene, camera);
		}

		animate();

		// Handle window resize
		window.addEventListener('resize', () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		});

		return () => {
			window.removeEventListener('resize', () => {}); // Clean up event listener
			container.removeChild(renderer.domElement); // Clean up renderer
		};
	});
</script>

<div bind:this={container} class="visualisation-container"></div>

<style>
	.visualisation-container {
		width: 100vw;
		height: 100vh;
		margin: 0;
		overflow: hidden; /* Prevent scrollbars */
	}
</style>
