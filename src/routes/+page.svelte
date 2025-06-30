<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { 
		heroEarthquake, 
		sectionEarthquake, 
		cardEarthquake, 
		creditsEarthquake 
	} from '$lib/actions';
	import { browser } from '$app/environment';

	let mounted = false;
	let heroSection: HTMLElement;
	let instrumentsSection: HTMLElement;
	
	// Theme system
	let isDarkMode = true; // Default to dark mode

	onMount(() => {
		mounted = true;
		
		// Load saved theme preference
		if (browser) {
			const savedTheme = localStorage.getItem('earthquake-theme');
			isDarkMode = savedTheme ? savedTheme === 'dark' : true; // Default to dark
			updateTheme();
		}
	});

	function toggleTheme() {
		isDarkMode = !isDarkMode;
		updateTheme();
		
		// Save preference
		if (browser) {
			localStorage.setItem('earthquake-theme', isDarkMode ? 'dark' : 'light');
		}
	}

	function updateTheme() {
		if (browser && document.body) {
			document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
		}
	}

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
	<!-- Theme Toggle Button -->
	<button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle theme">
		{#if isDarkMode}
			<!-- Sun icon for switching to light mode -->
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="5"/>
				<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
			</svg>
		{:else}
			<!-- Moon icon for switching to dark mode -->
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
			</svg>
		{/if}
	</button>

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
	/* CSS Custom Properties für Themes */
	:global(:root) {
		/* Light Mode (Default) */
		--bg-primary: #ffffff;
		--bg-secondary: #fafafa;
		--text-primary: #1a1a1a;
		--text-secondary: #6b7280;
		--accent-color: #2563eb;
		--border-color: rgba(0, 0, 0, 0.1);
		--border-light: rgba(0, 0, 0, 0.05);
		--shadow-color: rgba(0, 0, 0, 0.1);
	}

	:global([data-theme="dark"]) {
		/* Dark Mode */
		--bg-primary: #0a0a0a;
		--bg-secondary: #111111;
		--text-primary: #ffffff;
		--text-secondary: #a1a1aa;
		--accent-color: #3b82f6;
		--border-color: rgba(255, 255, 255, 0.1);
		--border-light: rgba(255, 255, 255, 0.05);
		--shadow-color: rgba(0, 0, 0, 0.3);
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'IBM Plex Sans', sans-serif;
		background: var(--bg-primary) !important;
		color: var(--text-primary) !important;
		line-height: 1.6;
		overflow: visible !important;
		transition: background-color 0.3s ease, color 0.3s ease;
	}

	:global(html) {
		scroll-behavior: smooth;
	}

	:global(*) {
		box-sizing: border-box;
	}

	/* Theme Toggle Button */
	.theme-toggle {
		position: fixed;
		top: 2rem;
		right: 2rem;
		z-index: 1000;
		width: 48px;
		height: 48px;
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		backdrop-filter: blur(10px);
		box-shadow: 0 4px 12px var(--shadow-color);
	}

	.theme-toggle:hover {
		border-color: var(--accent-color);
		transform: translateY(-1px);
		box-shadow: 0 6px 16px var(--shadow-color);
	}

	.theme-toggle svg {
		color: var(--text-secondary);
		transition: color 0.2s ease;
	}

	.theme-toggle:hover svg {
		color: var(--accent-color);
	}

	.main-container {
		min-height: 100vh;
		background: var(--bg-primary);
		transition: background-color 0.3s ease;
	}

	/* Hero Section */
	.hero-section {
		min-height: 90vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: var(--bg-primary);
		border-bottom: 1px solid var(--border-light);
		transition: background-color 0.3s ease, border-color 0.3s ease;
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
		color: var(--text-primary);
		font-weight: 300;
		transition: color 0.3s ease;
	}

	.title-accent {
		display: block;
		color: var(--accent-color);
		font-weight: 400;
		transition: color 0.3s ease;
	}

	.hero-subtitle {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 1.1rem;
		font-weight: 400;
		color: var(--text-secondary);
		max-width: 600px;
		margin: 0 auto;
		line-height: 1.6;
		transition: color 0.3s ease;
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
		border: 1px solid var(--accent-color);
		color: var(--accent-color);
		text-decoration: none;
		border-radius: 4px;
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 1rem;
		font-weight: 400;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.btn-primary:hover {
		background: var(--accent-color);
		color: var(--bg-primary);
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
		border: 1px solid var(--border-color);
		color: var(--text-secondary);
		border-radius: 4px;
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 1rem;
		font-weight: 400;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.btn-secondary:hover {
		border-color: var(--accent-color);
		color: var(--accent-color);
	}

	/* Instruments Section */
	.instruments-section {
		padding: 5rem 0;
		background: var(--bg-secondary);
		transition: background-color 0.3s ease;
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
		color: var(--text-primary);
		margin: 0 0 1.5rem 0;
		letter-spacing: -0.01em;
		transition: color 0.3s ease;
	}

	.section-description {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 1.1rem;
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.7;
		transition: color 0.3s ease;
	}

	/* Instruments Grid */
	.instruments-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 2rem;
		margin-bottom: 4rem;
	}

	.instrument-card {
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		border-radius: 4px;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.instrument-card:hover {
		border-color: var(--accent-color);
		transform: translateY(-2px);
		box-shadow: 0 8px 25px var(--shadow-color);
	}

	.card-image {
		height: 200px;
		overflow: hidden;
		background: var(--bg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		transition: background-color 0.3s ease;
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
		color: var(--text-primary);
		margin: 0 0 1rem 0;
		transition: color 0.3s ease;
	}

	.depth-range {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
		padding: 0.75rem 1rem;
		background: var(--bg-secondary);
		border-radius: 4px;
		border: 1px solid var(--border-light);
		transition: background-color 0.3s ease, border-color 0.3s ease;
	}

	.magnitude-range {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding: 0.75rem 1rem;
		background: var(--bg-secondary);
		border-radius: 4px;
		border: 1px solid var(--border-light);
		transition: background-color 0.3s ease, border-color 0.3s ease;
	}

	.volume-range {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding: 0.75rem 1rem;
		background: var(--bg-secondary);
		border-radius: 4px;
		border: 1px solid var(--border-light);
		transition: background-color 0.3s ease, border-color 0.3s ease;
	}

	.depth-label,
	.magnitude-label,
	.volume-label {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.85rem;
		color: var(--text-secondary);
		font-weight: 500;
		transition: color 0.3s ease;
	}

	.depth-value,
	.magnitude-value,
	.volume-value {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.9rem;
		color: var(--text-primary);
		font-weight: 600;
		transition: color 0.3s ease;
	}

	.card-description {
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 0.95rem;
		color: var(--text-secondary);
		margin: 0 0 1.5rem 0;
		transition: color 0.3s ease;
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
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		border-radius: 4px;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.info-item:hover {
		border-color: var(--accent-color);
		transform: translateY(-2px);
		box-shadow: 0 8px 25px var(--shadow-color);
	}

	.info-image {
		height: 120px;
		overflow: hidden;
		background: var(--bg-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		transition: background-color 0.3s ease;
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
		color: var(--text-primary);
		margin: 0 0 0.75rem 0;
		transition: color 0.3s ease;
	}

	.info-item p {
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 0.95rem;
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.6;
		transition: color 0.3s ease;
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
		background: var(--bg-primary);
		border-top: 1px solid var(--border-light);
		transition: background-color 0.3s ease, border-color 0.3s ease;
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
		color: var(--text-primary);
		margin: 0;
		letter-spacing: -0.01em;
		transition: color 0.3s ease;
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
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.7;
		max-width: 600px;
		transition: color 0.3s ease;
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
		color: var(--text-primary);
		margin: 0 0 1rem 0;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		transition: color 0.3s ease;
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
		color: var(--accent-color);
		font-weight: 500;
		transition: color 0.3s ease;
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
