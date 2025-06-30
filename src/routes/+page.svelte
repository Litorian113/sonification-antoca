<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	let mounted = false;
	let heroSection: HTMLElement;
	let instrumentsSection: HTMLElement;

	onMount(() => {
		mounted = true;
	});

	function scrollToInstruments() {
		if (instrumentsSection) {
			instrumentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:head>
	<title>Earthquake Sonification - Interactive Data Visualization</title>
	<meta name="description" content="Explore earthquake data through an interactive 3D globe and immersive sound visualization. Experience seismic events through music and visual mapping.">
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<main class="main-container">
	<!-- Hero Section -->
	<section class="hero-section" bind:this={heroSection}>
		<div class="hero-content" class:fade-in={mounted}>
			<div class="hero-header">
				<h1 class="hero-title">
					<span class="title-primary">Earthquake</span>
					<span class="title-accent">Sonification</span>
				</h1>
				<div class="hero-subtitle">
					Interactive visualization of seismic data through sound and 3D mapping
				</div>
			</div>
			
			<div class="hero-actions">
				<a href="{base}/visualisation" class="btn-primary">
					<span>Start Visualization</span>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M5 12h14M12 5l7 7-7 7"/>
					</svg>
				</a>
				
				<button class="btn-secondary" on:click={scrollToInstruments}>
					<span>Learn More</span>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M6 9l6 6 6-6"/>
					</svg>
				</button>
			</div>
		</div>
	</section>

	<!-- Instruments Section -->
	<section class="instruments-section" bind:this={instrumentsSection}>
		<div class="container">
			<div class="section-header">
				<h2 class="section-title">Sound Mapping System</h2>
				<p class="section-description">
					Earthquakes are mapped to different instruments based on their depth, creating a layered musical representation of seismic activity.
				</p>
			</div>

			<div class="instruments-grid">
				<!-- Violin - Surface Layer -->
				<div class="instrument-card violin-card">
					<div class="card-image">
						<img src="/img/violineIMG.png" alt="Violin representing surface earthquakes" loading="lazy">
					</div>
					<div class="card-content">
						<h3 class="card-title">Violin</h3>
						<div class="depth-range">
							<span class="depth-label">Depth Range</span>
							<span class="depth-value">0 - 30 km</span>
						</div>
						<div class="magnitude-range">
							<span class="magnitude-label">Magnitude Range</span>
							<span class="magnitude-value">5.5 - 7.5+</span>
						</div>
						<p class="card-description">
							Surface earthquakes produce high-pitched violin sounds. These shallow events often cause the most structural damage and are represented by blue tones. <strong>Volume increases with earthquake magnitude.</strong>
						</p>
						<div class="color-indicator violin-color"></div>
					</div>
				</div>

				<!-- Piano - Middle Layer -->
				<div class="instrument-card piano-card">
					<div class="card-image">
						<img src="/img/pianoIMG.png" alt="Piano representing intermediate depth earthquakes" loading="lazy">
					</div>
					<div class="card-content">
						<h3 class="card-title">Piano</h3>
						<div class="depth-range">
							<span class="depth-label">Depth Range</span>
							<span class="depth-value">30 - 100 km</span>
						</div>
						<div class="magnitude-range">
							<span class="magnitude-label">Magnitude Range</span>
							<span class="magnitude-value">5.5 - 7.5+</span>
						</div>
						<p class="card-description">
							Intermediate depth earthquakes are mapped to piano sounds with balanced tones. These events appear as warm orange colors and represent the middle crustal layer. <strong>Volume increases with earthquake magnitude.</strong>
						</p>
						<div class="color-indicator piano-color"></div>
					</div>
				</div>

				<!-- Accordion - Deep Layer -->
				<div class="instrument-card accordion-card">
					<div class="card-image">
						<img src="/img/accordionIMG.png" alt="Accordion representing deep earthquakes" loading="lazy">
					</div>
					<div class="card-content">
						<h3 class="card-title">Accordion</h3>
						<div class="depth-range">
							<span class="depth-label">Depth Range</span>
							<span class="depth-value">100+ km</span>
						</div>
						<div class="magnitude-range">
							<span class="magnitude-label">Magnitude Range</span>
							<span class="magnitude-value">5.5 - 7.5+</span>
						</div>
						<p class="card-description">
							Deep earthquakes are represented by rich accordion tones. These profound events appear as golden yellow colors and originate from the deepest crustal layers. <strong>Volume increases with earthquake magnitude.</strong>
						</p>
						<div class="color-indicator accordion-color"></div>
					</div>
				</div>

				<!-- Percussion - Catastrophic Events -->
				<div class="instrument-card percussion-card">
					<div class="card-image">
						<img src="/img/concussion.png" alt="Percussion representing catastrophic earthquakes" loading="lazy">
					</div>
					<div class="card-content">
						<h3 class="card-title">Percussion</h3>
						<div class="depth-range">
							<span class="depth-label">Magnitude</span>
							<span class="depth-value">8.0+</span>
						</div>
						<div class="magnitude-range">
							<span class="magnitude-label">Volume Range</span>
							<span class="magnitude-value">Very Loud</span>
						</div>
						<p class="card-description">
							Catastrophic earthquakes (magnitude 8+) trigger powerful percussion sounds regardless of depth. These rare, devastating events appear as bright cream-colored bursts. <strong>Maximum volume for catastrophic events.</strong>
						</p>
						<div class="color-indicator percussion-color"></div>
					</div>
				</div>
			</div>

			<div class="mapping-info">
				<div class="info-grid">
					<div class="info-item">
						<h4>Volume & Magnitude Mapping</h4>
						<p>Sound volume directly corresponds to earthquake magnitude (5.5-7.5+). Stronger earthquakes produce louder sounds, with catastrophic events (8.0+) triggering maximum volume percussion.</p>
					</div>
					<div class="info-item">
						<h4>Visual Layers</h4>
						<p>The 3D globe shows different depth layers, with surface events on the outer sphere and deep events on inner layers.</p>
					</div>
					<div class="info-item">
						<h4>Temporal Animation</h4>
						<p>Earthquakes play chronologically from 2010-2016, showing the evolution of seismic activity over time.</p>
					</div>
					<div class="info-item">
						<h4>Interactive Control</h4>
						<p>Filter instruments, adjust playback speed, and navigate through years to explore the data at your own pace.</p>
					</div>
				</div>
			</div>

			<div class="cta-section">
				<button class="btn-secondary" on:click={scrollToTop}>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 15l-6-6-6 6"/>
					</svg>
					<span>Back to Top</span>
				</button>
				
				<a href="{base}/visualisation" class="btn-primary large">
					<span>Experience the Sonification</span>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M5 12h14M12 5l7 7-7 7"/>
					</svg>
				</a>
			</div>
		</div>
	</section>
</main>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'IBM Plex Sans', sans-serif;
		background: #ffffff !important;
		color: #1a1a1a !important;
		line-height: 1.6;
		overflow: visible !important;
	}

	:global(html) {
		scroll-behavior: smooth;
	}

	:global(*) {
		box-sizing: border-box;
	}

	.main-container {
		min-height: 100vh;
		background: #ffffff;
	}

	/* Hero Section */
	.hero-section {
		min-height: 90vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: #ffffff;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	.hero-content {
		max-width: 800px;
		text-align: center;
		opacity: 0;
		transform: translateY(30px);
		transition: all 0.8s ease-out;
	}

	.hero-content.fade-in {
		opacity: 1;
		transform: translateY(0);
	}

	.hero-header {
		margin-bottom: 3rem;
	}

	.hero-title {
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: clamp(2.5rem, 8vw, 4.5rem);
		font-weight: 300;
		margin: 0 0 1.5rem 0;
		line-height: 1.1;
		letter-spacing: -0.02em;
	}

	.title-primary {
		display: block;
		color: #1a1a1a;
		font-weight: 300;
	}

	.title-accent {
		display: block;
		color: #2563eb;
		font-weight: 400;
	}

	.hero-subtitle {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 1.1rem;
		font-weight: 400;
		color: #6b7280;
		max-width: 600px;
		margin: 0 auto;
		line-height: 1.6;
	}

	.hero-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	/* Buttons */
	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem 2rem;
		background: transparent;
		border: 1px solid #2563eb;
		color: #2563eb;
		text-decoration: none;
		border-radius: 4px;
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 1rem;
		font-weight: 400;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.btn-primary:hover {
		background: #2563eb;
		color: #ffffff;
	}

	.btn-primary.large {
		padding: 1.25rem 2.5rem;
		font-size: 1.1rem;
	}

	.btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem 2rem;
		background: transparent;
		border: 1px solid rgba(0, 0, 0, 0.2);
		color: #6b7280;
		border-radius: 4px;
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 1rem;
		font-weight: 400;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.btn-secondary:hover {
		border-color: rgba(0, 0, 0, 0.4);
		color: #1a1a1a;
	}

	/* Instruments Section */
	.instruments-section {
		padding: 5rem 0;
		background: #fafafa;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.section-header {
		text-align: center;
		margin-bottom: 4rem;
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
	}

	.section-title {
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 300;
		color: #1a1a1a;
		margin: 0 0 1.5rem 0;
		letter-spacing: -0.01em;
	}

	.section-description {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 1.1rem;
		color: #6b7280;
		margin: 0;
		line-height: 1.7;
	}

	/* Instruments Grid */
	.instruments-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 2rem;
		margin-bottom: 4rem;
	}

	.instrument-card {
		background: #ffffff;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 4px;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.instrument-card:hover {
		border-color: rgba(0, 0, 0, 0.2);
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
	}

	.card-image {
		height: 200px;
		overflow: hidden;
		background: #f8f9fa;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.card-image img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		filter: grayscale(100%);
		opacity: 0.8;
		transition: all 0.3s ease;
	}

	.instrument-card:hover .card-image img {
		filter: grayscale(0%);
		opacity: 1;
	}

	.card-content {
		padding: 2rem;
	}

	.card-title {
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 1.5rem;
		font-weight: 500;
		color: #1a1a1a;
		margin: 0 0 1rem 0;
	}

	.depth-range {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
		padding: 0.75rem 1rem;
		background: #f8f9fa;
		border-radius: 4px;
	}

	.magnitude-range {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding: 0.75rem 1rem;
		background: #f8f9fa;
		border-radius: 4px;
	}

	.depth-label,
	.magnitude-label {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.85rem;
		color: #6b7280;
		font-weight: 500;
	}

	.depth-value,
	.magnitude-value {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.9rem;
		color: #1a1a1a;
		font-weight: 600;
	}

	.card-description {
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 0.95rem;
		color: #6b7280;
		margin: 0 0 1.5rem 0;
		line-height: 1.6;
	}

	.color-indicator {
		width: 100%;
		height: 6px;
		border-radius: 3px;
		margin-top: 1rem;
	}

	/* Instrument Colors - matching the visualization */
	.violin-color {
		background: linear-gradient(90deg, #1164B6, #3398F1);
	}

	.piano-color {
		background: linear-gradient(90deg, #C43B29, #FF4F14);
	}

	.accordion-color {
		background: linear-gradient(90deg, #E7A22E, #F8AE31);
	}

	.percussion-color {
		background: #FFF4D2;
	}

	/* Mapping Info */
	.mapping-info {
		margin: 4rem 0;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.info-item {
		padding: 2rem;
		background: #ffffff;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 4px;
	}

	.info-item h4 {
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 1.1rem;
		font-weight: 500;
		color: #1a1a1a;
		margin: 0 0 0.75rem 0;
	}

	.info-item p {
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 0.95rem;
		color: #6b7280;
		margin: 0;
		line-height: 1.6;
	}

	/* CTA Section */
	.cta-section {
		text-align: center;
		padding: 3rem 0;
		display: flex;
		gap: 1rem;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
	}

	/* Responsive Design */
	@media (max-width: 1024px) {
		.instruments-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 1.5rem;
		}
	}

	@media (max-width: 768px) {
		.hero-section {
			padding: 1rem;
		}

		.hero-actions {
			flex-direction: column;
			align-items: center;
		}

		.btn-primary,
		.btn-secondary {
			min-width: 200px;
			justify-content: center;
		}

		.instruments-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.container {
			padding: 0 1rem;
		}

		.info-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.info-item {
			padding: 1.5rem;
		}
	}

	@media (max-width: 480px) {
		.hero-section {
			min-height: 90vh;
		}

		.card-image {
			height: 150px;
			padding: 1rem;
		}

		.card-content {
			padding: 1.5rem;
		}

		.depth-range {
			flex-direction: column;
			gap: 0.25rem;
			text-align: center;
		}
	}
</style>
