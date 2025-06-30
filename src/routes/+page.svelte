<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { 
		heroEarthquake, 
		sectionEarthquake, 
		cardEarthquake, 
		creditsEarthquake 
	} from '$lib/actions';

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
				<h1 class="hero-title" use:heroEarthquake>
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
				<h2 class="section-title" use:sectionEarthquake>Sound Mapping System</h2>
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
						<h3 class="card-title" use:cardEarthquake>Violin</h3>
						<div class="depth-range">
							<span class="depth-label">Depth Range</span>
							<span class="depth-value">0 - 30 km</span>
						</div>
						<div class="magnitude-range">
							<span class="magnitude-label">Magnitude Range</span>
							<span class="magnitude-value">5.5 - 7.5+</span>
						</div>
						<div class="volume-range">
							<span class="volume-label">Volume Mapping</span>
							<span class="volume-value">mag * 0.15</span>
						</div>
						<p class="card-description">
							Surface earthquakes produce high-pitched violin sounds. These shallow events often cause the most structural damage and are represented by blue tones.
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
						<h3 class="card-title" use:cardEarthquake>Piano</h3>
						<div class="depth-range">
							<span class="depth-label">Depth Range</span>
							<span class="depth-value">30 - 100 km</span>
						</div>
						<div class="magnitude-range">
							<span class="magnitude-label">Magnitude Range</span>
							<span class="magnitude-value">5.5 - 7.5+</span>
						</div>
						<div class="volume-range">
							<span class="volume-label">Volume Mapping</span>
							<span class="volume-value">mag * 0.15</span>
						</div>
						<p class="card-description">
							Intermediate depth earthquakes are mapped to piano sounds with balanced tones. These events appear as warm orange colors and represent the middle crustal layer.
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
						<h3 class="card-title" use:cardEarthquake>Accordion</h3>
						<div class="depth-range">
							<span class="depth-label">Depth Range</span>
							<span class="depth-value">100+ km</span>
						</div>
						<div class="magnitude-range">
							<span class="magnitude-label">Magnitude Range</span>
							<span class="magnitude-value">5.5 - 7.5+</span>
						</div>
						<div class="volume-range">
							<span class="volume-label">Volume Mapping</span>
							<span class="volume-value">mag * 0.15</span>
						</div>
						<p class="card-description">
							Deep earthquakes are represented by rich accordion tones. These profound events appear as golden yellow colors and originate from the deepest crustal layers.
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
						<h3 class="card-title" use:cardEarthquake>Percussion</h3>
						<div class="depth-range">
							<span class="depth-label">Audio Level</span>
							<span class="depth-value">Max</span>
						</div>
						<div class="magnitude-range">
							<span class="magnitude-label">Trigger Level</span>
							<span class="magnitude-value">Catastrophic</span>
						</div>
						<div class="volume-range">
							<span class="volume-label">Volume Mapping</span>
							<span class="volume-value">mag * 0.8</span>
						</div>
						<p class="card-description">
							Catastrophic earthquakes (magnitude 8+) trigger powerful percussion sounds regardless of depth. These rare, devastating events appear as bright cream-colored bursts.
						</p>
						<div class="color-indicator percussion-color"></div>
					</div>
				</div>
			</div>

			<div class="mapping-info">
				<div class="info-grid">
					<div class="info-item">
						<div class="info-image">
							<img src="/cards/VolumeMagnitudeMapping.png" alt="Volume and Magnitude Mapping visualization" loading="lazy">
						</div>
						<div class="info-content">
							<h4>Volume & Magnitude Mapping</h4>
							<p>Sound volume directly corresponds to earthquake magnitude (5.5-7.5+). Stronger earthquakes produce louder sounds, with catastrophic events (8.0+) triggering maximum volume percussion.</p>
						</div>
					</div>
					<div class="info-item">
						<div class="info-image">
							<img src="/cards/VisualLayers.png" alt="Visual layers representation" loading="lazy">
						</div>
						<div class="info-content">
							<h4>Visual Layers</h4>
							<p>The 3D globe shows different depth layers, with surface events on the outer sphere and deep events on inner layers.</p>
						</div>
					</div>
					<div class="info-item">
						<div class="info-image">
							<img src="/cards/TemporalAnimation.png" alt="Temporal animation visualization" loading="lazy">
						</div>
						<div class="info-content">
							<h4>Temporal Animation</h4>
							<p>Earthquakes play chronologically from 2010-2016, showing the evolution of seismic activity over time.</p>
						</div>
					</div>
					<div class="info-item">
						<div class="info-image">
							<img src="/cards/InteractiveControl.png" alt="Interactive control interface" loading="lazy">
						</div>
						<div class="info-content">
							<h4>Interactive Control</h4>
							<p>Filter instruments, adjust playback speed, and navigate through years to explore the data at your own pace.</p>
						</div>
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

	<!-- Credits Section -->
	<section class="credits-section">
		<div class="container">
			<div class="credits-content">
				<div class="credits-header">
					<h2 class="credits-title" use:creditsEarthquake>Project Credits</h2>
				</div>
				
				<div class="credits-info">
					<p class="course-info">
						This project was created as part of the course <strong>"Audio in der Interaktionsgestaltung"</strong> in SoSe 2025 at HfG Schwäbisch Gmünd.
					</p>
					
					<div class="supervision">
						<h4>Supervision</h4>
						<div class="supervisors">
							<span>David Oswald</span>
							<span>Rasih Bayoelken</span>
						</div>
					</div>
					
					<div class="team">
						<h4>Interaction Design 4</h4>
						<div class="team-members">
							<div class="member">Vivien Cai</div>
							<div class="member">Rebeka Tot</div>
							<div class="member">Franz Anhäupl</div>
						</div>
					</div>
				</div>
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

	.volume-range {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding: 0.75rem 1rem;
		background: #f8f9fa;
		border-radius: 4px;
	}

	.depth-label,
	.magnitude-label,
	.volume-label {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.85rem;
		color: #6b7280;
		font-weight: 500;
	}

	.depth-value,
	.magnitude-value,
	.volume-value {
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
		background: #ffffff;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 4px;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.info-item:hover {
		border-color: rgba(0, 0, 0, 0.2);
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
	}

	.info-image {
		height: 120px;
		overflow: hidden;
		background: #f8f9fa;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.info-image img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		filter: grayscale(100%);
		opacity: 0.8;
		transition: all 0.3s ease;
	}

	.info-item:hover .info-image img {
		filter: grayscale(0%);
		opacity: 1;
	}

	.info-content {
		padding: 1.5rem;
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

	/* Credits Section */
	.credits-section {
		padding: 4rem 0;
		background: #ffffff;
		border-top: 1px solid rgba(0, 0, 0, 0.05);
	}

	.credits-content {
		max-width: 800px;
		margin: 0 auto;
		text-align: center;
	}

	.credits-header {
		margin-bottom: 3rem;
	}

	.credits-title {
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: clamp(1.5rem, 4vw, 2.5rem);
		font-weight: 300;
		color: #1a1a1a;
		margin: 0;
		letter-spacing: -0.01em;
	}

	.credits-info {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
		align-items: center;
	}

	.course-info {
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 1.1rem;
		color: #6b7280;
		margin: 0;
		line-height: 1.7;
		max-width: 600px;
	}

	.supervision,
	.team {
		text-align: center;
	}

	.supervision h4,
	.team h4 {
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 1rem;
		font-weight: 500;
		color: #1a1a1a;
		margin: 0 0 1rem 0;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.supervisors {
		display: flex;
		gap: 2rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.supervisors span {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 1rem;
		color: #2563eb;
		font-weight: 500;
	}

	.team-members {
		display: flex;
		gap: 2rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.member {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 1rem;
		color: #1a1a1a;
		font-weight: 500;
		padding: 0.5rem 1rem;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 4px;
		transition: all 0.2s ease;
	}

	.member:hover {
		border-color: rgba(0, 0, 0, 0.2);
		background: #f8f9fa;
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
			grid-template-columns: repeat(2, 1fr);
			gap: 1rem;
		}

		.info-content {
			padding: 1rem;
		}

		.info-image {
			height: 80px;
			padding: 0.5rem;
		}

		.credits-section {
			padding: 2rem 0;
		}

		.credits-info {
			gap: 2rem;
		}

		.supervisors,
		.team-members {
			gap: 1rem;
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

		.info-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.info-content {
			padding: 1rem;
		}

		.info-image {
			height: 100px;
			padding: 1rem;
		}

		.depth-range {
			flex-direction: column;
			gap: 0.25rem;
			text-align: center;
		}

		.team-members {
			flex-direction: column;
			align-items: center;
		}

		.supervisors {
			flex-direction: column;
			align-items: center;
		}
	}
</style>
