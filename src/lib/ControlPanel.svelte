<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	// Props - alle Control-Zustände werden von der Parent-Komponente verwaltet
	export let isPlaying = false;
	export let isGlobeRotating = true;
	export let animationSpeed = 150;
	export let instrumentEnabled = {
		accordion: true,
		piano: true,
		violin: true
	};
	export let currentYear: number | null = null;
	export let hasPlayed: boolean = false;
	export let minYear = 2010;
	export let maxYear = 2016;
	export let selectedYear = 2010;
	export let useAlternativeInstruments: {
		deep: boolean;
		medium: boolean;
		shallow: boolean;
		catastrophic: boolean;
	};

	// Side panel state
	let isPanelOpen = true;

	// Event handlers - dispatchen Events zurück zur Parent-Komponente
	function handlePlayToggle() {
		dispatch('playToggle');
	}

	function handleRotationToggle() {
		dispatch('rotationToggle');
	}

	function handleClearDots() {
		dispatch('clearDots');
	}

	function handleSpeedChange() {
		dispatch('speedChange', animationSpeed);
	}

	function handleInstrumentToggle(instrument: 'accordion' | 'piano' | 'violin') {
		dispatch('instrumentToggle', instrument);
	}

	function handleYearChange() {
		dispatch('yearChange', selectedYear);
	}

	function handleAlternativeInstrumentToggle(type: 'deep' | 'medium' | 'shallow' | 'catastrophic') {
		dispatch('alternativeInstrumentToggle', { type });
	}

	function togglePanel() {
		isPanelOpen = !isPanelOpen;
	}

	// Check if all instruments are disabled
	$: allInstrumentsDisabled = !instrumentEnabled.accordion && !instrumentEnabled.piano && !instrumentEnabled.violin;

	function toggleAllInstruments() {
		if (allInstrumentsDisabled) {
			// Enable all instruments
			dispatch('instrumentToggle', 'accordion');
			dispatch('instrumentToggle', 'piano'); 
			dispatch('instrumentToggle', 'violin');
		} else {
			// Disable all instruments that are currently enabled
			if (instrumentEnabled.accordion) dispatch('instrumentToggle', 'accordion');
			if (instrumentEnabled.piano) dispatch('instrumentToggle', 'piano');
			if (instrumentEnabled.violin) dispatch('instrumentToggle', 'violin');
		}
	}
</script>

<!-- Header Controls -->
<div class="header-controls">
	<a href="/" class="home-btn" aria-label="Go to Home Page" title="Home">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
			<polyline points="9,22 9,12 15,12 15,22"/>
		</svg>
	</a>
	
	<button 
		class="panel-toggle" 
		class:open={isPanelOpen}
		on:click={togglePanel}
		aria-label={isPanelOpen ? 'Close Control Panel' : 'Open Control Panel'}
	>
		<div class="toggle-icon">
			<span></span>
			<span></span>
			<span></span>
		</div>
	</button>
</div>

<!-- Side Panel -->
<aside class="control-panel" class:open={isPanelOpen}>
	<div class="panel-header">
		<h2>Control Panel</h2>
		<div class="header-accent"></div>
	</div>

	<div class="panel-content">
		<!-- Playback Controls -->
		<section class="control-section">
			<h3>Playback</h3>
			<div class="control-group">
				<button
					class="control-btn primary"
					class:playing={isPlaying}
					on:click={handlePlayToggle}
				>
					{isPlaying ? "Stop Sonification" : "Play Sonification"}
				</button>

				<button
					class="control-btn secondary"
					on:click={handleRotationToggle}
				>
					{isGlobeRotating ? "Stop Rotation" : "Start Rotation"}
				</button>

				<button
					class="control-btn tertiary"
					on:click={handleClearDots}
					disabled={isPlaying}
				>
					Clear Epicenter Dots
				</button>
			</div>
		</section>

		<!-- Speed Control -->
		<section class="control-section">
			<h3>Animation Speed</h3>
			<div class="slider-container">
				<input
					type="range"
					min="10"
					max="500"
					bind:value={animationSpeed}
					on:input={handleSpeedChange}
					class="speed-slider"
				/>
				<div class="slider-value">{animationSpeed}ms</div>
			</div>
		</section>

		<!-- Year Navigation -->
		<section class="control-section">
			<h3>Timeline Navigation</h3>
			<div class="year-control">
				{#if currentYear}
					<div class="year-info">
						<span class="year-label">Current Year</span>
						<span class="year-number">{currentYear}</span>
					</div>
				{/if}
				<div class="year-slider-container">
					<input
						type="range"
						min={minYear}
						max={maxYear}
						bind:value={selectedYear}
						on:input={handleYearChange}
						class="year-slider"
					/>
					<div class="year-range">
						<span>{minYear}</span>
						<span>{maxYear}</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Instrument Controls -->
		<section class="control-section">
			<h3>Instruments</h3>
			<div class="instrument-controls">
				<div class="instrument-buttons">
					<button
						class="instrument-btn {instrumentEnabled.violin ? 'active' : 'inactive'}"
						on:click={() => handleInstrumentToggle('violin')}
						title="{useAlternativeInstruments.shallow ? 'Clarinet' : 'Violin'} (Shallow: 0-30km)"
					>
						<img src="{useAlternativeInstruments.shallow ? '/additionalInstruments/clarinette.png' : '/img/violineIMG.png'}" alt="{useAlternativeInstruments.shallow ? 'Clarinet' : 'Violin'}" class="instrument-image">
					</button>

					<button
						class="instrument-btn {instrumentEnabled.piano ? 'active' : 'inactive'}"
						on:click={() => handleInstrumentToggle('piano')}
						title="{useAlternativeInstruments.medium ? 'Saxophone' : 'Piano'} (Medium: 30-100km)"
					>
						<img src="{useAlternativeInstruments.medium ? '/additionalInstruments/saxGuy.png' : '/img/pianoIMG.png'}" alt="{useAlternativeInstruments.medium ? 'Saxophone' : 'Piano'}" class="instrument-image">
					</button>

					<button
						class="instrument-btn {instrumentEnabled.accordion ? 'active' : 'inactive'}"
						on:click={() => handleInstrumentToggle('accordion')}
						title="{useAlternativeInstruments.deep ? 'Brass Ensemble' : 'Accordion'} (Deep: >100km)"
					>
						<img src="{useAlternativeInstruments.deep ? '/additionalInstruments/brassEnsemble.png' : '/img/accordionIMG.png'}" alt="{useAlternativeInstruments.deep ? 'Brass Ensemble' : 'Accordion'}" class="instrument-image">
					</button>

					<button
						class="instrument-btn percussion"
						title="{useAlternativeInstruments.catastrophic ? 'Gong' : 'Percussion'} (Catastrophic: Magnitude 8+)"
						disabled
					>
						<img src="{useAlternativeInstruments.catastrophic ? '/additionalInstruments/gong.png' : '/img/concussion.png'}" alt="{useAlternativeInstruments.catastrophic ? 'Gong' : 'Percussion'}" class="instrument-image">
					</button>
				</div>
				
				<button
					class="toggle-all-btn"
					on:click={toggleAllInstruments}
					title={allInstrumentsDisabled ? "Enable all instruments" : "Disable all instruments"}
				>
					{allInstrumentsDisabled ? "Enable All" : "Disable All"}
				</button>
			</div>

			<!-- Alternative Instruments -->
			<div class="alternative-instruments">
				<!-- Shallow Earthquakes (0-30km) -->
				<div class="depth-section">
					<div class="depth-header">
						<div class="depth-color-indicator shallow"></div>
						<span class="depth-label">Shallow (0-30km)</span>
					</div>
					<div class="instrument-toggle-row">
						<button
							class="alt-instrument-toggle {!useAlternativeInstruments.shallow ? 'active' : 'inactive'}"
							on:click={() => useAlternativeInstruments.shallow && handleAlternativeInstrumentToggle('shallow')}
							disabled={!instrumentEnabled.violin}
						>
							<img src="/img/violineIMG.png" alt="Violin" class="alt-instrument-image">
							<span class="instrument-label">Violin</span>
						</button>
						<button
							class="alt-instrument-toggle {useAlternativeInstruments.shallow ? 'active' : 'inactive'}"
							on:click={() => !useAlternativeInstruments.shallow && handleAlternativeInstrumentToggle('shallow')}
							disabled={!instrumentEnabled.violin}
						>
							<img src="/additionalInstruments/clarinette.png" alt="Clarinet" class="alt-instrument-image">
							<span class="instrument-label">Clarinet</span>
						</button>
					</div>
				</div>

				<!-- Medium Earthquakes (30-100km) -->
				<div class="depth-section">
					<div class="depth-header">
						<div class="depth-color-indicator medium"></div>
						<span class="depth-label">Medium (30-100km)</span>
					</div>
					<div class="instrument-toggle-row">
						<button
							class="alt-instrument-toggle {!useAlternativeInstruments.medium ? 'active' : 'inactive'}"
							on:click={() => useAlternativeInstruments.medium && handleAlternativeInstrumentToggle('medium')}
							disabled={!instrumentEnabled.piano}
						>
							<img src="/img/pianoIMG.png" alt="Piano" class="alt-instrument-image">
							<span class="instrument-label">Piano</span>
						</button>
						<button
							class="alt-instrument-toggle {useAlternativeInstruments.medium ? 'active' : 'inactive'}"
							on:click={() => !useAlternativeInstruments.medium && handleAlternativeInstrumentToggle('medium')}
							disabled={!instrumentEnabled.piano}
						>
							<img src="/additionalInstruments/saxGuy.png" alt="Saxophone" class="alt-instrument-image">
							<span class="instrument-label">Saxophone</span>
						</button>
					</div>
				</div>

				<!-- Deep Earthquakes (>100km) -->
				<div class="depth-section">
					<div class="depth-header">
						<div class="depth-color-indicator deep"></div>
						<span class="depth-label">Deep (>100km)</span>
					</div>
					<div class="instrument-toggle-row">
						<button
							class="alt-instrument-toggle {!useAlternativeInstruments.deep ? 'active' : 'inactive'}"
							on:click={() => useAlternativeInstruments.deep && handleAlternativeInstrumentToggle('deep')}
							disabled={!instrumentEnabled.accordion}
						>
							<img src="/img/accordionIMG.png" alt="Accordion" class="alt-instrument-image">
							<span class="instrument-label">Accordion</span>
						</button>
						<button
							class="alt-instrument-toggle {useAlternativeInstruments.deep ? 'active' : 'inactive'}"
							on:click={() => !useAlternativeInstruments.deep && handleAlternativeInstrumentToggle('deep')}
							disabled={!instrumentEnabled.accordion}
						>
							<img src="/additionalInstruments/brassEnsemble.png" alt="Brass Ensemble" class="alt-instrument-image">
							<span class="instrument-label">Brass</span>
						</button>
					</div>
				</div>

				<!-- Catastrophic Earthquakes (Magnitude 8+) -->
				<div class="depth-section">
					<div class="depth-header">
						<div class="depth-color-indicator catastrophic"></div>
						<span class="depth-label">Catastrophic (8+ Magnitude)</span>
					</div>
					<div class="instrument-toggle-row">
						<button
							class="alt-instrument-toggle {!useAlternativeInstruments.catastrophic ? 'active' : 'inactive'}"
							on:click={() => useAlternativeInstruments.catastrophic && handleAlternativeInstrumentToggle('catastrophic')}
						>
							<img src="/img/concussion.png" alt="Percussion" class="alt-instrument-image">
							<span class="instrument-label">Percussion</span>
						</button>
						<button
							class="alt-instrument-toggle {useAlternativeInstruments.catastrophic ? 'active' : 'inactive'}"
							on:click={() => !useAlternativeInstruments.catastrophic && handleAlternativeInstrumentToggle('catastrophic')}
						>
							<img src="/additionalInstruments/gong.png" alt="Gong" class="alt-instrument-image">
							<span class="instrument-label">Gong</span>
						</button>
					</div>
				</div>
			</div>
		</section>

		<!-- Data Info -->
		<section class="control-section">
			<h3>Dataset</h3>
			<div class="data-info">
				<span class="data-range">2010 - 2016 Earthquakes</span>
			</div>
		</section>

		<!-- Credits -->
		<section class="control-section">
			<h3>Made by</h3>
			<div class="credits">
				<div class="credit-name">Vivien Cai</div>
				<div class="credit-name">Rebeka Tot</div>
				<div class="credit-name">Franz Anhäupl</div>
			</div>
		</section>
	</div>
</aside>



<style>
	/* Header Controls */
	.header-controls {
		position: fixed;
		top: 30px;
		left: 30px;
		z-index: 1001;
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.home-btn {
		width: 44px;
		height: 44px;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		text-decoration: none;
		color: rgba(255, 255, 255, 0.8);
	}

	.home-btn:hover {
		border-color: rgba(255, 255, 255, 0.4);
		background: rgba(255, 255, 255, 0.02);
		color: rgba(255, 255, 255, 1);
	}

	.home-btn svg {
		width: 20px;
		height: 20px;
	}

	/* Toggle Button */
	.panel-toggle {
		width: 44px;
		height: 44px;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.panel-toggle:hover {
		border-color: rgba(255, 255, 255, 0.4);
		background: rgba(255, 255, 255, 0.02);
	}

	.panel-toggle.open {
		border-color: rgba(255, 255, 255, 0.4);
		background: rgba(255, 255, 255, 0.05);
	}

	.toggle-icon {
		width: 16px;
		height: 12px;
		position: relative;
		transform: rotate(0deg);
		transition: 0.2s ease;
	}

	.toggle-icon span {
		display: block;
		position: absolute;
		height: 1px;
		width: 100%;
		background: rgba(255, 255, 255, 0.8);
		border-radius: 1px;
		opacity: 1;
		left: 0;
		transform: rotate(0deg);
		transition: 0.2s ease;
	}

	.toggle-icon span:nth-child(1) {
		top: 0px;
	}

	.toggle-icon span:nth-child(2) {
		top: 5px;
	}

	.toggle-icon span:nth-child(3) {
		top: 10px;
	}

	.panel-toggle.open .toggle-icon span:nth-child(1) {
		top: 5px;
		transform: rotate(135deg);
	}

	.panel-toggle.open .toggle-icon span:nth-child(2) {
		opacity: 0;
		left: -60px;
	}

	.panel-toggle.open .toggle-icon span:nth-child(3) {
		top: 5px;
		transform: rotate(-135deg);
	}

	/* Side Panel */
	.control-panel {
		position: fixed;
		top: 0;
		left: 0;
		width: 380px;
		height: 100vh;
		background: linear-gradient(180deg, 
			rgba(17, 24, 39, 0.95) 0%, 
			rgba(31, 41, 55, 0.95) 50%, 
			rgba(17, 24, 39, 0.95) 100%);
		backdrop-filter: blur(20px);
		border-right: 1px solid rgba(51, 152, 241, 0.2);
		transform: translateX(-100%);
		transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 1000;
		overflow-y: auto;
		box-shadow: 0 0 50px rgba(0, 0, 0, 0.3);
	}

	.control-panel.open {
		transform: translateX(0);
	}

	.panel-header {
		padding: 100px 40px 40px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		position: relative;
	}

	.panel-header h2 {
		margin: 0;
		font-size: 22px;
		font-weight: 400;
		color: white;
		letter-spacing: 0.5px;
		font-family: "IBM Plex Sans", sans-serif;
	}

	.header-accent {
		display: none;
	}

	.panel-content {
		padding: 0 40px 40px;
	}

	/* Control Sections */
	.control-section {
		margin-bottom: 50px;
		padding-bottom: 0;
		border-bottom: none;
	}

	.control-section:last-child {
		border-bottom: none;
	}

	.control-section h3 {
		margin: 30px 0 20px 0;
		font-size: 12px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 1.5px;
		font-family: "IBM Plex Sans", sans-serif;
	}

	/* Control Buttons */
	.control-group {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.control-btn {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 20px;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		font-size: 14px;
		transition: all 0.2s ease;
		font-family: "IBM Plex Sans", sans-serif;
		text-align: left;
		color: rgba(255, 255, 255, 0.9);
	}

	.control-btn.primary {
		border-color: rgba(51, 152, 241, 0.4);
		color: #3398F1;
	}

	.control-btn.primary.playing {
		border-color: rgba(51, 152, 241, 0.8);
		color: #3398F1;
		background: rgba(51, 152, 241, 0.05);
	}

	.control-btn.secondary {
		border-color: rgba(255, 255, 255, 0.3);
		color: rgba(255, 255, 255, 0.8);
	}

	.control-btn.tertiary {
		border-color: rgba(255, 255, 255, 0.2);
		color: rgba(255, 255, 255, 0.6);
	}

	.control-btn:hover:not(:disabled) {
		border-color: rgba(255, 255, 255, 0.5);
		background: rgba(255, 255, 255, 0.02);
	}

	.control-btn.primary:hover:not(:disabled) {
		border-color: rgba(51, 152, 241, 0.6);
		background: rgba(51, 152, 241, 0.08);
	}

	.control-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	/* Slider Controls */
	.slider-container {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.speed-slider {
		width: 100%;
		height: 6px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
		outline: none;
		-webkit-appearance: none;
		appearance: none;
	}

	.speed-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		background: linear-gradient(45deg, #3398F1, #1164B6);
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 0 10px rgba(51, 152, 241, 0.5);
	}

	.speed-slider::-moz-range-thumb {
		width: 20px;
		height: 20px;
		background: linear-gradient(45deg, #3398F1, #1164B6);
		border-radius: 50%;
		cursor: pointer;
		border: none;
		box-shadow: 0 0 10px rgba(51, 152, 241, 0.5);
	}

	.slider-value {
		font-size: 12px;
		color: #3398F1;
		font-weight: 600;
		text-align: center;
		background: rgba(51, 152, 241, 0.15);
		padding: 6px 12px;
		border-radius: 20px;
		border: 1px solid rgba(51, 152, 241, 0.3);
	}

	/* Instrument Controls */
	.instrument-controls {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.instrument-buttons {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
	}

	.instrument-btn {
		width: 60px;
		height: 60px;
		background: transparent;
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
	}

	.instrument-btn:hover:not(:disabled) {
		border-color: rgba(255, 255, 255, 0.4);
		transform: translateY(-2px);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	}

	.instrument-btn.active {
		border-color: #3398F1;
		background: rgba(51, 152, 241, 0.1);
		box-shadow: 0 0 20px rgba(51, 152, 241, 0.3);
	}

	.instrument-btn.inactive {
		opacity: 0.4;
		filter: grayscale(0.7);
	}

	.instrument-btn.percussion {
		opacity: 0.6;
		cursor: not-allowed;
		border-color: rgba(255, 244, 210, 0.3);
	}

	.instrument-btn.percussion:hover {
		transform: none;
		box-shadow: none;
		border-color: rgba(255, 244, 210, 0.3);
	}

	.instrument-image {
		width: 36px;
		height: 36px;
		object-fit: contain;
		transition: all 0.3s ease;
	}

	.instrument-btn.active .instrument-image {
		filter: brightness(1.2) saturate(1.2);
	}

	.instrument-btn.inactive .instrument-image {
		filter: grayscale(0.7) brightness(0.6);
	}

	.toggle-all-btn {
		width: 100%;
		padding: 12px 16px;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 6px;
		cursor: pointer;
		color: rgba(255, 255, 255, 0.8);
		font-size: 12px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 1px;
		transition: all 0.2s ease;
		font-family: "IBM Plex Sans", sans-serif;
	}

	.toggle-all-btn:hover {
		border-color: rgba(255, 255, 255, 0.4);
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 1);
	}

	/* Alternative Instruments */
	.alternative-instruments {
		margin-top: 16px;
		padding-top: 16px;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.depth-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.depth-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
	}

	.depth-color-indicator {
		width: 12px;
		height: 12px;
		border-radius: 6px;
		flex-shrink: 0;
	}

	.depth-color-indicator.shallow {
		background: linear-gradient(45deg, #3398F1, #1164B6);
		box-shadow: 0 0 6px rgba(51, 152, 241, 0.4);
	}

	.depth-color-indicator.medium {
		background: linear-gradient(45deg, #FF4F14, #C43B29);
		box-shadow: 0 0 6px rgba(255, 79, 20, 0.4);
	}

	.depth-color-indicator.deep {
		background: linear-gradient(45deg, #F8AE31, #E7A22E);
		box-shadow: 0 0 6px rgba(248, 174, 49, 0.4);
	}

	.depth-color-indicator.catastrophic {
		background: #FFF4D2;
		box-shadow: 0 0 6px rgba(255, 244, 210, 0.4);
	}

	.depth-label {
		font-size: 11px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.8);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-family: "IBM Plex Sans", sans-serif;
	}

	.instrument-toggle-row {
		display: flex;
		gap: 6px;
	}

	.alt-instrument-toggle {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.3s ease;
		font-family: "IBM Plex Sans", sans-serif;
	}

	.alt-instrument-toggle:hover:not(:disabled) {
		border-color: rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.05);
	}

	.alt-instrument-toggle.active {
		border-color: #3398F1;
		background: rgba(51, 152, 241, 0.1);
		box-shadow: 0 0 15px rgba(51, 152, 241, 0.2);
	}

	.alt-instrument-toggle.inactive {
		opacity: 0.6;
	}

	.alt-instrument-toggle:disabled {
		opacity: 0.3;
		cursor: not-allowed;
		filter: grayscale(0.7);
	}

	.alt-instrument-toggle:disabled:hover {
		border-color: rgba(255, 255, 255, 0.15);
		background: transparent;
	}

	.alt-instrument-image {
		width: 20px;
		height: 20px;
		object-fit: contain;
		transition: all 0.3s ease;
		flex-shrink: 0;
	}

	.alt-instrument-toggle.active .alt-instrument-image {
		filter: brightness(1.2) saturate(1.2);
	}

	.alt-instrument-toggle.inactive .alt-instrument-image {
		filter: grayscale(0.3) brightness(0.8);
	}

	.alt-instrument-toggle:disabled .alt-instrument-image {
		filter: grayscale(1) brightness(0.5);
	}

	.instrument-label {
		font-size: 11px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.8);
		transition: all 0.3s ease;
	}

	.alt-instrument-toggle.active .instrument-label {
		color: #3398F1;
		font-weight: 600;
	}

	.alt-instrument-toggle:disabled .instrument-label {
		color: rgba(255, 255, 255, 0.4);
	}

	/* Responsive Design for Alternative Instruments */
	@media (max-width: 768px) {
		.alternative-instruments {
			gap: 12px;
		}

		.depth-label {
			font-size: 10px;
		}

		.alt-instrument-toggle {
			padding: 8px 10px;
			gap: 6px;
		}

		.alt-instrument-image {
			width: 16px;
			height: 16px;
		}

		.instrument-label {
			font-size: 10px;
		}

		.depth-color-indicator {
			width: 10px;
			height: 10px;
		}
	}

	/* Remove old styles */
	.alt-instrument-buttons {
		display: none;
	}

	.alt-instrument-btn {
		display: none;
	}

	/* Instrument Grid (Old styles to keep existing compatibility) */
	.instrument-grid {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.instrument-toggle {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 20px;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: "IBM Plex Sans", sans-serif;
	}

	.instrument-toggle.active {
		border-color: rgba(255, 255, 255, 0.3);
	}

	.instrument-toggle.inactive {
		opacity: 0.4;
	}

	.instrument-toggle:hover {
		border-color: rgba(255, 255, 255, 0.4);
		background: rgba(255, 255, 255, 0.02);
	}

	.instrument-color {
		width: 20px;
		height: 20px;
		border-radius: 8px;
		flex-shrink: 0;
	}

	.instrument-color.violin {
		background: linear-gradient(45deg, #3398F1, #1164B6);
		box-shadow: 0 0 8px rgba(51, 152, 241, 0.4);
	}

	.instrument-color.piano {
		background: linear-gradient(45deg, #FF4F14, #C43B29);
		box-shadow: 0 0 8px rgba(255, 79, 20, 0.4);
	}

	.instrument-color.accordion {
		background: linear-gradient(45deg, #F8AE31, #E7A22E);
		box-shadow: 0 0 8px rgba(248, 174, 49, 0.4);
	}

	.instrument-color.percussion {
		background: #FFF4D2;
		box-shadow: 0 0 8px rgba(255, 244, 210, 0.4);
	}

	.instrument-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.instrument-name {
		font-size: 14px;
		font-weight: 600;
		color: white;
	}

	.instrument-depth {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.7);
	}

	.instrument-info-item {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 20px;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 4px;
	}

	.toggle-indicator {
		width: 16px;
		height: 16px;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 2px;
		position: relative;
		transition: all 0.2s ease;
	}

	.instrument-toggle.active .toggle-indicator {
		border-color: white;
		background: white;
	}

	.instrument-toggle.active .toggle-indicator::after {
		content: '✓';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: #000;
		font-size: 10px;
		font-weight: bold;
	}

	/* Data Info */
	.data-info {
		text-align: left;
	}

	.data-range {
		display: inline-block;
		padding: 12px 0;
		color: rgba(255, 255, 255, 0.7);
		font-size: 13px;
		font-weight: 400;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	/* Credits */
	.credits {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.credit-name {
		color: rgba(255, 255, 255, 0.6);
		font-size: 12px;
		font-weight: 400;
		font-family: "IBM Plex Sans", sans-serif;
	}

	/* Year Navigation */
	.year-control {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.year-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		margin-bottom: 20px;
	}

	.year-label {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.6);
		font-weight: 400;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.year-number {
		font-size: 16px;
		color: white;
		font-weight: 500;
		font-family: "IBM Plex Mono", monospace;
	}

	.year-slider-container {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.year-slider {
		width: 100%;
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
		width: 20px;
		height: 20px;
		background: linear-gradient(45deg, #3398F1, #1164B6);
		border-radius: 50%;
		cursor: pointer;
		box-shadow: 0 0 10px rgba(51, 152, 241, 0.5);
	}

	.year-slider::-moz-range-thumb {
		width: 20px;
		height: 20px;
		background: linear-gradient(45deg, #3398F1, #1164B6);
		border-radius: 50%;
		cursor: pointer;
		border: none;
		box-shadow: 0 0 10px rgba(51, 152, 241, 0.5);
	}

	.year-range {
		display: flex;
		justify-content: space-between;
		font-size: 11px;
		color: rgba(255, 255, 255, 0.5);
		font-weight: 500;
		font-family: "IBM Plex Mono", monospace;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.control-panel {
			width: 100vw;
		}

		.panel-toggle {
			top: 20px;
			left: 20px;
		}
	}

	/* Scrollbar Styling */
	.control-panel::-webkit-scrollbar {
		width: 6px;
	}

	.control-panel::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
	}

	.control-panel::-webkit-scrollbar-thumb {
		background: linear-gradient(45deg, #3398F1, #1164B6);
		border-radius: 3px;
	}

	.control-panel::-webkit-scrollbar-thumb:hover {
		background: linear-gradient(45deg, #1164B6, #3398F1);
	}

	/* Scrollbar Styling */
	.control-panel::-webkit-scrollbar {
		width: 6px;
	}

	.control-panel::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
	}

	.control-panel::-webkit-scrollbar-thumb {
		background: linear-gradient(45deg, #3398F1, #1164B6);
		border-radius: 3px;
	}

	.control-panel::-webkit-scrollbar-thumb:hover {
		background: linear-gradient(45deg, #1164B6, #3398F1);
	}
</style>
