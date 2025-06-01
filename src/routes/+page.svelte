<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	let mounted = false;

	onMount(() => {
		mounted = true;
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="container">
	<div class="background-animation">
		<div class="particle"></div>
		<div class="particle"></div>
		<div class="particle"></div>
		<div class="particle"></div>
		<div class="particle"></div>
		<div class="particle"></div>
	</div>
	
	<div class="content" class:fade-in={mounted}>
		<div class="title-container">
			<h1 class="main-title">
				<span class="title-line">Earthquake</span>
				<span class="title-line highlight">Sonification</span>
			</h1>
			<div class="title-underline"></div>
		</div>
		
		<p class="description">
			Explore earthquake data through an interactive 3D globe and immersive sound visualization
		</p>
		
		<div class="cta-container">
			<a href="{base}/visualisation" class="btn">
				<span class="btn-text">Start Visualization</span>
				<div class="btn-glow"></div>
			</a>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'IBM Plex Mono', monospace;
		background: #0a0a0a;
		color: #ffffff;
		overflow: hidden;
	}

	.container {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		text-align: center;
		background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
		overflow: hidden;
	}

	.background-animation {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		overflow: hidden;
	}

	.particle {
		position: absolute;
		width: 2px;
		height: 2px;
		background: #64ffda;
		border-radius: 50%;
		animation: float 6s ease-in-out infinite;
		box-shadow: 0 0 10px #64ffda;
	}

	.particle:nth-child(1) {
		top: 20%;
		left: 10%;
		animation-delay: 0s;
		animation-duration: 8s;
	}

	.particle:nth-child(2) {
		top: 60%;
		left: 80%;
		animation-delay: 2s;
		animation-duration: 6s;
	}

	.particle:nth-child(3) {
		top: 40%;
		left: 60%;
		animation-delay: 4s;
		animation-duration: 7s;
	}

	.particle:nth-child(4) {
		top: 80%;
		left: 30%;
		animation-delay: 1s;
		animation-duration: 9s;
	}

	.particle:nth-child(5) {
		top: 10%;
		left: 70%;
		animation-delay: 3s;
		animation-duration: 5s;
	}

	.particle:nth-child(6) {
		top: 70%;
		left: 20%;
		animation-delay: 5s;
		animation-duration: 8s;
	}

	@keyframes float {
		0%, 100% {
			transform: translateY(0px) scale(1);
			opacity: 0.8;
		}
		50% {
			transform: translateY(-20px) scale(1.2);
			opacity: 1;
		}
	}

	.content {
		position: relative;
		z-index: 1;
		opacity: 0;
		transform: translateY(30px);
		transition: all 1s ease-out;
	}

	.content.fade-in {
		opacity: 1;
		transform: translateY(0);
	}

	.title-container {
		margin-bottom: 2rem;
	}

	.main-title {
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: clamp(3rem, 8vw, 6rem);
		font-weight: 700;
		margin: 0;
		line-height: 1.1;
		letter-spacing: -0.02em;
	}

	.title-line {
		display: block;
		animation: slideInLeft 1s ease-out 0.5s both;
	}

	.title-line:nth-child(2) {
		animation-delay: 0.7s;
	}

	.highlight {
		background: linear-gradient(45deg, #64ffda, #00bcd4, #009688);
		background-size: 200% 200%;
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		animation: gradientShift 3s ease-in-out infinite, slideInLeft 1s ease-out 0.7s both;
	}

	.title-underline {
		width: 0;
		height: 4px;
		background: linear-gradient(90deg, #64ffda, #00bcd4);
		margin: 1rem auto;
		border-radius: 2px;
		animation: expandWidth 1s ease-out 1.2s both;
	}

	@keyframes slideInLeft {
		from {
			opacity: 0;
			transform: translateX(-50px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes expandWidth {
		to {
			width: 200px;
		}
	}

	@keyframes gradientShift {
		0%, 100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}

	.description {
		font-family: 'IBM Plex Mono', monospace;
		font-size: clamp(1rem, 2.5vw, 1.25rem);
		font-weight: 400;
		color: #b0b0b0;
		max-width: 600px;
		margin: 0 auto 3rem;
		line-height: 1.6;
		opacity: 0;
		animation: fadeInUp 1s ease-out 1.5s both;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.cta-container {
		opacity: 0;
		animation: fadeInUp 1s ease-out 1.8s both;
	}

	.btn {
		position: relative;
		display: inline-block;
		padding: 1rem 2.5rem;
		background: transparent;
		border: 2px solid #64ffda;
		color: #64ffda;
		text-decoration: none;
		border-radius: 50px;
		font-family: 'IBM Plex Sans', sans-serif;
		font-size: 1.1rem;
		font-weight: 600;
		letter-spacing: 0.5px;
		text-transform: uppercase;
		overflow: hidden;
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.btn:hover {
		color: #0a0a0a;
		transform: translateY(-2px);
		box-shadow: 0 10px 30px rgba(100, 255, 218, 0.3);
	}

	.btn:hover .btn-glow {
		width: 100%;
		height: 100%;
	}

	.btn-text {
		position: relative;
		z-index: 2;
	}

	.btn-glow {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		background: #64ffda;
		border-radius: 50px;
		transform: translate(-50%, -50%);
		transition: all 0.3s ease;
		z-index: 1;
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}
		
		.description {
			padding: 0 1rem;
		}
		
		.btn {
			padding: 0.8rem 2rem;
			font-size: 1rem;
		}
	}
</style>
