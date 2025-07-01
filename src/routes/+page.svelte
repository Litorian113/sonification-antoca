<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { 
		heroEarthquake, 
		sectionEarthquake, 
		cardEarthquake, 
		creditsEarthquake,
		hoverShake
	} from '$lib/actions';
	import { browser } from '$app/environment';

	let mounted = false;
	let heroSection: HTMLElement;
	let instrumentsSection: HTMLElement;
	
	// Theme system
	let isDarkMode = true; // Default to dark mode
	
	// Orbit toggle system
	let orbitToggles = {
		surface: 'violin', // 'violin' or 'clarinet'
		middle: 'piano',   // 'piano' or 'saxophone'
		deep: 'accordion'  // 'accordion' or 'brass'
	};

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
	
	// Orbit toggle functions
	function toggleOrbitInstrument(layer: 'surface' | 'middle' | 'deep') {
		if (layer === 'surface') {
			orbitToggles.surface = orbitToggles.surface === 'violin' ? 'clarinet' : 'violin';
		} else if (layer === 'middle') {
			orbitToggles.middle = orbitToggles.middle === 'piano' ? 'saxophone' : 'piano';
		} else if (layer === 'deep') {
			orbitToggles.deep = orbitToggles.deep === 'accordion' ? 'brass' : 'accordion';
		}
		// Trigger reactivity
		orbitToggles = { ...orbitToggles };
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
	<button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle theme" use:hoverShake>
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
				<a href="{base}/visualisation" class="btn-primary" use:hoverShake>
					<span>Start Visualization</span>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M5 12h14M12 5l7 7-7 7"/>
					</svg>
				</a>
				
				<button class="btn-secondary" on:click={scrollToInstruments} use:hoverShake>
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
				<div class="instrument-card violin-card" use:hoverShake>
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
				<div class="instrument-card piano-card" use:hoverShake>
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
				<div class="instrument-card accordion-card" use:hoverShake>
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
				<div class="instrument-card percussion-card" use:hoverShake>
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
					<div class="info-item" use:hoverShake>
						<div class="info-image">
							<img src="/cards/VolumeMagnitudeMapping.png" alt="Volume and Magnitude Mapping visualization" loading="lazy">
						</div>
						<div class="info-content">
							<h4>Volume & Magnitude Mapping</h4>
							<p>Sound volume directly corresponds to earthquake magnitude (5.5-7.5+). Stronger earthquakes produce louder sounds, with catastrophic events (8.0+) triggering maximum volume percussion.</p>
						</div>
					</div>
					<div class="info-item" use:hoverShake>
						<div class="info-image">
							<img src="/cards/VisualLayers.png" alt="Visual layers representation" loading="lazy">
						</div>
						<div class="info-content">
							<h4>Visual Layers</h4>
							<p>The 3D globe shows different depth layers, with surface events on the outer sphere and deep events on inner layers.</p>
						</div>
					</div>
					<div class="info-item" use:hoverShake>
						<div class="info-image">
							<img src="/cards/TemporalAnimation.png" alt="Temporal animation visualization" loading="lazy">
						</div>
						<div class="info-content">
							<h4>Temporal Animation</h4>
							<p>Earthquakes play chronologically from 2010-2016, showing the evolution of seismic activity over time.</p>
						</div>
					</div>
					<div class="info-item" use:hoverShake>
						<div class="info-image">
							<img src="/cards/InteractiveControl.png" alt="Interactive control interface" loading="lazy">
						</div>
						<div class="info-content">
							<h4>Interactive Control</h4>
							<p>Filter instruments, adjust playback speed, and navigate through years to explore the data at your own pace.</p>
						</div>
					</div>			</div>
		</div>

		<!-- Orbiting Instruments Animation -->
		<div class="orbiting-section">
			<div class="orbiting-container">
				<h3 class="orbiting-title">Instrument Layers</h3>
				<p class="orbiting-description">
					Each seismic layer is represented by a different instrument, which can be toggled to explore alternative soundscapes.
				</p>
				
				<div class="orbiting-content">
					<!-- Toggle Controls arranged in a 3x2 grid -->
					<div class="orbit-toggles">
						<!-- First row: Primary instruments -->
						<button 
							class="orbit-toggle violin-toggle {orbitToggles.surface === 'violin' ? 'active' : 'inactive'}"
							on:click={() => toggleOrbitInstrument('surface')}
							aria-label="Select violin for surface layer"
							use:hoverShake
						>
							<img src="/img/violineIMG.png" alt="Violin" />
						</button>
						
						<button 
							class="orbit-toggle piano-toggle {orbitToggles.middle === 'piano' ? 'active' : 'inactive'}"
							on:click={() => toggleOrbitInstrument('middle')}
							aria-label="Select piano for middle layer"
							use:hoverShake
						>
							<img src="/img/pianoIMG.png" alt="Piano" />
						</button>
						
						<button 
							class="orbit-toggle accordion-toggle {orbitToggles.deep === 'accordion' ? 'active' : 'inactive'}"
							on:click={() => toggleOrbitInstrument('deep')}
							aria-label="Select accordion for deep layer"
							use:hoverShake
						>
							<img src="/img/accordionIMG.png" alt="Accordion" />
						</button>
						
						<!-- Second row: Alternative instruments -->
						<button 
							class="orbit-toggle clarinet-toggle {orbitToggles.surface === 'clarinet' ? 'active' : 'inactive'}"
							on:click={() => toggleOrbitInstrument('surface')}
							aria-label="Select clarinet for surface layer"
							use:hoverShake
						>
							<img src="/additionalInstruments/clarinette.png" alt="Clarinet" />
						</button>
						
						<button 
							class="orbit-toggle saxophone-toggle {orbitToggles.middle === 'saxophone' ? 'active' : 'inactive'}"
							on:click={() => toggleOrbitInstrument('middle')}
							aria-label="Select saxophone for middle layer"
							use:hoverShake
						>
							<img src="/additionalInstruments/saxGuy.png" alt="Saxophone" />
						</button>
						
						<button 
							class="orbit-toggle brass-toggle {orbitToggles.deep === 'brass' ? 'active' : 'inactive'}"
							on:click={() => toggleOrbitInstrument('deep')}
							aria-label="Select brass ensemble for deep layer"
							use:hoverShake
						>
							<img src="/additionalInstruments/brassEnsemble.png" alt="Brass Ensemble" />
						</button>
					</div>
					
					<!-- Orbiting Animation -->
					<div class="orbiting-circles">
						<!-- Orbit paths -->
						<div class="orbit-path orbit-outer"></div>
						<div class="orbit-path orbit-middle"></div>
						<div class="orbit-path orbit-inner"></div>
						
						<!-- Orbiting instruments -->
						<div class="orbiting-item {orbitToggles.surface === 'violin' ? 'violin-orbit' : 'clarinet-orbit'}">
							<img 
								src={orbitToggles.surface === 'violin' ? '/img/violineIMG.png' : '/additionalInstruments/clarinette.png'} 
								alt={orbitToggles.surface === 'violin' ? 'Violin - Surface Layer' : 'Clarinet - Surface Layer'}
							/>
							<span class="orbit-label">Surface</span>
						</div>
						
						<div class="orbiting-item {orbitToggles.middle === 'piano' ? 'piano-orbit' : 'saxophone-orbit'}">
							<img 
								src={orbitToggles.middle === 'piano' ? '/img/pianoIMG.png' : '/additionalInstruments/saxGuy.png'} 
								alt={orbitToggles.middle === 'piano' ? 'Piano - Middle Layer' : 'Saxophone - Middle Layer'}
							/>
							<span class="orbit-label">Middle</span>
						</div>
						
						<div class="orbiting-item {orbitToggles.deep === 'accordion' ? 'accordion-orbit' : 'brass-orbit'}">
							<img 
								src={orbitToggles.deep === 'accordion' ? '/img/accordionIMG.png' : '/additionalInstruments/brassEnsemble.png'} 
								alt={orbitToggles.deep === 'accordion' ? 'Accordion - Deep Layer' : 'Brass Ensemble - Deep Layer'}
							/>
							<span class="orbit-label">Deep</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="cta-section">
			<button class="btn-secondary" on:click={scrollToTop} use:hoverShake>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M18 15l-6-6-6 6"/>
					</svg>
					<span>Back to Top</span>
				</button>
				
				<a href="{base}/visualisation" class="btn-primary large" use:hoverShake>
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
		--bg-primary: #f6f6f6;
		--bg-secondary: #eeeeee;
		--text-primary: #1a1a1a;
		--text-secondary: #6b7280;
		--accent-color: #2563eb;
		--border-color: rgba(0, 0, 0, 0.1);
		--border-light: rgba(0, 0, 0, 0.05);
		--shadow-color: rgba(0, 0, 0, 0.1);
		--grid-color: rgba(0, 0, 0, 0.08);
	}

	:global([data-theme="dark"]) {
		/* Dark Mode */
		--bg-primary: #0a0a0a;
		--bg-secondary: #111111;
		--text-primary: #f6f6f6;
		--text-secondary: #a1a1aa;
		--accent-color: #3b82f6;
		--border-color: rgba(255, 255, 255, 0.1);
		--border-light: rgba(255, 255, 255, 0.05);
		--shadow-color: rgba(0, 0, 0, 0.3);
		--grid-color: rgba(255, 255, 255, 0.08);
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
		padding: 6rem 0;
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
		margin-bottom: 5rem;
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
		margin-bottom: 6rem;
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
		margin: 8rem 0 6rem 0;
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

	/* Orbiting Instruments Section */
	.orbiting-section {
		padding: 6rem 0;
		text-align: center;
		background: var(--bg-secondary);
		position: relative;
		overflow: hidden;
		transition: background-color 0.3s ease;
	}

	/* Subtle grid background */
	.orbiting-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: 
			linear-gradient(var(--grid-color) 1px, transparent 1px),
			linear-gradient(90deg, var(--grid-color) 1px, transparent 1px);
		background-size: 40px 40px;
		opacity: 0.4;
		mask: radial-gradient(ellipse 80% 60% at center, black 30%, rgba(0,0,0,0.6) 60%, transparent 100%);
		-webkit-mask: radial-gradient(ellipse 80% 60% at center, black 30%, rgba(0,0,0,0.6) 60%, transparent 100%);
		pointer-events: none;
		transition: background-image 0.3s ease, opacity 0.3s ease;
	}

	.orbiting-container {
		max-width: 600px;
		margin: 0 auto;
		position: relative;
		z-index: 1;
	}

	.orbiting-title {
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 2rem;
		font-weight: 300;
		color: var(--text-primary);
		margin: 0 0 1rem 0;
		transition: color 0.3s ease;
	}
	
	.orbiting-description {
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 0.9rem;
		color: var(--text-secondary);
		margin: 0 0 3rem 0;
		line-height: 1.6;
		max-width: 500px;
		margin-left: auto;
		margin-right: auto;
		transition: color 0.3s ease;
	}
	
	.orbiting-content {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 3rem;
		flex-wrap: wrap;
	}

	.orbiting-circles {
		position: relative;
		width: 500px;
		height: 500px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Orbit paths (visual guides) */
	.orbit-path {
		position: absolute;
		border: 1.5px dashed var(--border-color);
		border-radius: 50%;
		opacity: 0.6;
		transition: all 0.3s ease;
		box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05);
	}

	.orbit-path:hover {
		opacity: 0.8;
		border-width: 2px;
	}

	.orbit-outer {
		width: 480px;
		height: 480px;
		top: 10px;
		left: 10px;
	}

	.orbit-middle {
		width: 320px;
		height: 320px;
		top: 90px;
		left: 90px;
	}

	.orbit-inner {
		width: 160px;
		height: 160px;
		top: 170px;
		left: 170px;
	}

	/* Orbiting items */
	.orbiting-item {
		position: absolute;
		width: 80px;
		height: 80px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: var(--bg-primary);
		border: 2px solid var(--border-color);
		border-radius: 50%;
		padding: 12px;
		box-shadow: 0 4px 12px var(--shadow-color);
		transition: all 0.3s ease;
	}

	.orbiting-item:hover {
			/* border-color: var(--accent-color); */
		transform: scale(1.1);
		z-index: 10;
	}

	.orbiting-item img {
		width: 32px;
		height: 32px;
		object-fit: contain;
		filter: grayscale(100%);
		transition: filter 0.3s ease;
	}

	.orbiting-item:hover img {
		filter: grayscale(0%);
	}

	.orbit-label {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 8px;
		color: var(--text-secondary);
		margin-top: 4px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		transition: color 0.3s ease;
	}

	.orbiting-item:hover .orbit-label {
		color: var(--accent-color);
	}

	/* Animation keyframes */
	@keyframes orbit {
		from {
			transform: rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg);
		}
		to {
			transform: rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg);
		}
	}

	/* Violin - Outer orbit */
	.violin-orbit {
		--orbit-radius: 240px;
		animation: orbit 20s linear infinite;
		border-color: #3398F1;
	}

	/* Piano - Middle orbit */
	.piano-orbit {
		--orbit-radius: 160px;
		animation: orbit 15s linear infinite;
		border-color: #FF4F14;
	}

	/* Accordion - Inner orbit */
	.accordion-orbit {
		--orbit-radius: 80px;
		animation: orbit 10s linear infinite;
		border-color: #F8AE31;
	}
	
	/* Alternative instrument orbits */
	.clarinet-orbit {
		--orbit-radius: 240px;
		animation: orbit 20s linear infinite;
		border-color: #3398F1;
	}
	
	.saxophone-orbit {
		--orbit-radius: 160px;
		animation: orbit 15s linear infinite;
		border-color: #FF4F14;
	}
	
	.brass-orbit {
		--orbit-radius: 80px;
		animation: orbit 10s linear infinite;
		border-color: #F8AE31;
	}
	
	/* Orbit Toggle Controls */
	.orbit-toggles {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(2, 1fr);
		gap: 1.5rem;
		max-width: 300px;
		margin: 0 auto 2rem;
		justify-items: center;
		align-items: center;
	}
	
	.orbit-toggle {
		position: relative;
		width: 80px;
		height: 80px;
		background: var(--bg-primary);
		border: 2px solid var(--border-color);
		border-radius: 50%;
		padding: 12px;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px var(--shadow-color);
		overflow: hidden;
	}
	
	.orbit-toggle:hover {
		transform: scale(1.1);
		box-shadow: 0 6px 20px var(--shadow-color);
	}
	
	.orbit-toggle:active {
		transform: scale(0.95);
	}
	
	.orbit-toggle img {
		width: 32px;
		height: 32px;
		object-fit: contain;
		transition: all 0.3s ease;
	}
	
	/* Active states with full color and opacity */
	.orbit-toggle.active {
		opacity: 1;
	}
	
	.orbit-toggle.active img {
		opacity: 1;
		filter: grayscale(0%);
	}
	
	/* Inactive states with reduced opacity and slight grayscale */
	.orbit-toggle.inactive {
		opacity: 0.4;
	}
	
	.orbit-toggle.inactive img {
		opacity: 0.6;
		filter: grayscale(30%);
	}
	
	.orbit-toggle.inactive:hover {
		opacity: 0.7;
	}
	
	.orbit-toggle.inactive:hover img {
		opacity: 0.8;
		filter: grayscale(10%);
	}
	
	/* Specific instrument color coding for active states */
	.violin-toggle.active,
	.clarinet-toggle.active {
		border-color: #3398F1;
		background: rgba(51, 152, 241, 0.1);
	}
	
	.piano-toggle.active,
	.saxophone-toggle.active {
		border-color: #FF4F14;
		background: rgba(255, 79, 20, 0.1);
	}
	
	.accordion-toggle.active,
	.brass-toggle.active {
		border-color: #F8AE31;
		background: rgba(248, 174, 49, 0.1);
	}
	
	/* Enhanced hover effects for active instruments */
	.violin-toggle.active:hover,
	.clarinet-toggle.active:hover {
		border-color: #3398F1;
		background: rgba(51, 152, 241, 0.2);
		box-shadow: 0 6px 20px rgba(51, 152, 241, 0.3);
	}
	
	.piano-toggle.active:hover,
	.saxophone-toggle.active:hover {
		border-color: #FF4F14;
		background: rgba(255, 79, 20, 0.2);
		box-shadow: 0 6px 20px rgba(255, 79, 20, 0.3);
	}
	
	.accordion-toggle.active:hover,
	.brass-toggle.active:hover {
		border-color: #F8AE31;
		background: rgba(248, 174, 49, 0.2);
		box-shadow: 0 6px 20px rgba(248, 174, 49, 0.3);
	}

	/* CTA Section */
	.cta-section {
		text-align: center;
		padding: 4rem 0;
		display: flex;
		gap: 1rem;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
	}

	/* Credits Section */
	.credits-section {
		padding: 6rem 0;
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
		margin-bottom: 4rem;
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
		color: var(--text-primary);
		font-weight: 500;
		padding: 0.5rem 1rem;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 4px;
		transition: all 0.2s ease;
	}

	.member:hover {
		border-color: rgba(0, 0, 0, 0.2);
		background: var(--bg-secondary);
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
			padding: 3rem 0;
		}

		.instruments-section {
			padding: 4rem 0;
		}

		.orbiting-section {
			padding: 4rem 0;
		}

		.credits-info {
			gap: 2rem;
		}

		.supervisors,
		.team-members {
			gap: 1rem;
		}

		/* Orbiting Animation - Tablet */
		.orbiting-circles {
			width: 400px;
			height: 400px;
		}

		.orbit-outer {
			width: 380px;
			height: 380px;
			top: 10px;
			left: 10px;
		}

		.orbit-middle {
			width: 260px;
			height: 260px;
			top: 70px;
			left: 70px;
		}

		.orbit-inner {
			width: 140px;
			height: 140px;
			top: 130px;
			left: 130px;
		}

		.violin-orbit {
			--orbit-radius: 190px;
		}

		.piano-orbit {
			--orbit-radius: 130px;
		}

		.accordion-orbit {
			--orbit-radius: 70px;
		}
		
		.clarinet-orbit {
			--orbit-radius: 190px;
		}

		.saxophone-orbit {
			--orbit-radius: 130px;
		}

		.brass-orbit {
			--orbit-radius: 70px;
		}

		.orbiting-item {
			width: 70px;
			height: 70px;
			padding: 10px;
		}

		.orbiting-item img {
			width: 28px;
			height: 28px;
		}
		
		.orbit-toggle {
			width: 70px;
			height: 70px;
			padding: 10px;
		}
		
		.orbit-toggle img {
			width: 28px;
			height: 28px;
		}
		
		.orbiting-content {
			gap: 2rem;
		}
		
		.orbit-toggles {
			gap: 1.2rem;
			max-width: 250px;
		}
		
		.orbit-toggle {
			width: 60px;
			height: 60px;
			padding: 8px;
		}
		
		.orbit-toggle img {
			width: 24px;
			height: 24px;
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

		/* Orbiting Animation - Mobile */
		.orbiting-section {
			padding: 3rem 0;
		}

		.orbiting-title {
			font-size: 1.5rem;
			margin-bottom: 3rem;
		}

		.orbiting-circles {
			width: 300px;
			height: 300px;
		}

		.orbit-outer {
			width: 280px;
			height: 280px;
			top: 10px;
			left: 10px;
		}

		.orbit-middle {
			width: 200px;
			height: 200px;
			top: 50px;
			left: 50px;
		}

		.orbit-inner {
			width: 120px;
			height: 120px;
			top: 90px;
			left: 90px;
		}

		.violin-orbit {
			--orbit-radius: 140px;
		}

		.piano-orbit {
			--orbit-radius: 100px;
		}

		.accordion-orbit {
			--orbit-radius: 60px;
		}
		
		.clarinet-orbit {
			--orbit-radius: 140px;
		}

		.saxophone-orbit {
			--orbit-radius: 100px;
		}

		.brass-orbit {
			--orbit-radius: 60px;
		}

		.orbiting-item {
			width: 60px;
			height: 60px;
			padding: 8px;
		}

		.orbiting-item img {
			width: 24px;
			height: 24px;
		}

		.orbit-label {
			font-size: 7px;
			margin-top: 2px;
		}
		
		.orbit-toggle {
			width: 60px;
			height: 60px;
			padding: 8px;
		}
		
		.orbit-toggle img {
			width: 24px;
			height: 24px;
		}
		
		.orbiting-content {
			flex-direction: column;
			gap: 1.5rem;
		}
		
		.orbit-toggles {
			gap: 1rem;
			max-width: 200px;
		}
		
		.orbit-toggle {
			width: 50px;
			height: 50px;
			padding: 6px;
		}
		
		.orbit-toggle img {
			width: 20px;
			height: 20px;
		}
		
		.orbiting-description {
			font-size: 0.8rem;
			margin-bottom: 2rem;
		}
	}
</style>
