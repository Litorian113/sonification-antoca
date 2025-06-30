// Simplified earthquake animations for common use cases
import { earthquakeAnimation } from './earthquakeAnimation.js';

// Pre-configured earthquake actions for different scenarios

// Hero title - strong earthquake on page load
export const heroEarthquake = (node: HTMLElement) => {
	return earthquakeAnimation(node, {
		trigger: 'immediate',
		duration: 2000,
		delay: 500,
		intensity: 'high',
		once: true
	});
};

// Section titles - medium earthquake on scroll
export const sectionEarthquake = (node: HTMLElement) => {
	return earthquakeAnimation(node, {
		trigger: 'scroll',
		duration: 1500,
		intensity: 'medium',
		once: true
	});
};

// Card titles - subtle earthquake on scroll
export const cardEarthquake = (node: HTMLElement) => {
	return earthquakeAnimation(node, {
		trigger: 'scroll',
		duration: 1200,
		intensity: 'low',
		once: true
	});
};

// Credits - very subtle earthquake
export const creditsEarthquake = (node: HTMLElement) => {
	return earthquakeAnimation(node, {
		trigger: 'scroll',
		duration: 1000,
		intensity: 'low',
		once: true
	});
};

// Hover shake effect - quick shake on hover
export const hoverShake = (node: HTMLElement) => {
	// Add CSS class for hover effect
	node.classList.add('earthquake-hover');
	
	return {
		destroy() {
			node.classList.remove('earthquake-hover');
		}
	};
};
