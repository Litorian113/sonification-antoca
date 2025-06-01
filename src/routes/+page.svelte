<script lang="ts">
	import { base } from '$app/paths';
</script>

<div class="container">
	<h1>Earthquake Sonification</h1>
	<p>Explore earthquake data through an interactive 3D globe and sound.</p>
	<a href="{base}/visualisation" class="btn">Start Visualisation</a>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		text-align: center;
	}

	.btn {
		display: inline-block;
		margin-top: 20px;
		padding: 10px 20px;
		background-color: #007bff;
		color: white;
		text-decoration: none;
		border-radius: 5px;
		font-size: 1.2em;
	}

	.btn:hover {
		background-color: #0056b3;
	}
</style>
