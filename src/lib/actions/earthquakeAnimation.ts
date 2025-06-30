import type { ActionReturn } from 'svelte/action';

interface EarthquakeOptions {
	trigger?: 'immediate' | 'scroll';
	duration?: number;
	delay?: number;
	intensity?: 'low' | 'medium' | 'high';
	once?: boolean;
}

interface EarthquakeAttributes {
	'on:earthquakeStart'?: (e: CustomEvent) => void;
	'on:earthquakeEnd'?: (e: CustomEvent) => void;
}

// Global tracking for animated elements
const animatedElements = new Set<Element>();

export function earthquakeAnimation(
	node: HTMLElement, 
	options: EarthquakeOptions = {}
): ActionReturn<EarthquakeOptions, EarthquakeAttributes> {
	
	const {
		trigger = 'scroll',
		duration = 1500,
		delay = 0,
		intensity = 'medium',
		once = true
	} = options;

	let animationTimeout: number;
	let observer: IntersectionObserver | null = null;
	let hasAnimated = false;

	// CSS Animation keyframes (injected once)
	if (!document.getElementById('earthquake-styles')) {
		const style = document.createElement('style');
		style.id = 'earthquake-styles';
		style.textContent = `
			@keyframes earthquake-shake {
				0% {
					filter: blur(0);
					transform: translate(0) rotate(0deg);
				}
				5%, 15%, 25%, 35%, 55%, 65%, 75%, 95% {
					filter: blur(0.015em);
					transform: translateY(0.015em) rotate(0.1deg);
				}
				10%, 30%, 40%, 50%, 70%, 80%, 90% {
					filter: blur(0.008em);
					transform: translateY(-0.015em) rotate(-0.1deg);
				}
				20%, 60% {
					filter: blur(0.025em);
					transform: translate(-0.015em, 0.015em) rotate(0.2deg);
				}
				45%, 85% {
					filter: blur(0.025em);
					transform: translate(0.015em, -0.015em) rotate(-0.2deg);
				}
				100% {
					filter: blur(0);
					transform: translate(0) rotate(0deg);
				}
			}

			@keyframes earthquake-intense {
				0%, 100% {
					transform: translate(0) rotate(0deg);
					filter: blur(0);
				}
				2% {
					transform: translate(0.5px, -1px) rotate(-0.5deg);
					filter: blur(0.01em);
				}
				4% {
					transform: translate(-1px, 0.5px) rotate(0.3deg);
					filter: blur(0.015em);
				}
				6% {
					transform: translate(-1.5px, -0.5px) rotate(-0.2deg);
					filter: blur(0.008em);
				}
				8% {
					transform: translate(1px, 1px) rotate(0.4deg);
					filter: blur(0.02em);
				}
				10% {
					transform: translate(-0.5px, -1.5px) rotate(-0.3deg);
					filter: blur(0.012em);
				}
				12% {
					transform: translate(1.5px, 0.5px) rotate(0.2deg);
					filter: blur(0.018em);
				}
				14% {
					transform: translate(-1px, -1px) rotate(-0.4deg);
					filter: blur(0.009em);
				}
				16% {
					transform: translate(0.5px, 1.5px) rotate(0.1deg);
					filter: blur(0.022em);
				}
				18% {
					transform: translate(-1.5px, 0px) rotate(-0.2deg);
					filter: blur(0.013em);
				}
				20% {
					transform: translate(1px, -0.5px) rotate(0.3deg);
					filter: blur(0.016em);
				}
				25% {
					transform: translate(-0.5px, 1px) rotate(-0.1deg);
					filter: blur(0.01em);
				}
				30% {
					transform: translate(0.5px, -0.5px) rotate(0.2deg);
					filter: blur(0.008em);
				}
				35% {
					transform: translate(-1px, 0.5px) rotate(-0.15deg);
					filter: blur(0.006em);
				}
				40% {
					transform: translate(0.5px, 0.5px) rotate(0.1deg);
					filter: blur(0.004em);
				}
				45% {
					transform: translate(-0.5px, -0.5px) rotate(-0.1deg);
					filter: blur(0.003em);
				}
				50% {
					transform: translate(0.3px, 0.3px) rotate(0.05deg);
					filter: blur(0.002em);
				}
				60% {
					transform: translate(-0.2px, 0.2px) rotate(-0.03deg);
					filter: blur(0.001em);
				}
				70% {
					transform: translate(0.1px, -0.1px) rotate(0.02deg);
					filter: blur(0.0005em);
				}
				80% {
					transform: translate(-0.1px, 0.1px) rotate(-0.01deg);
					filter: blur(0.0003em);
				}
				90% {
					transform: translate(0.05px, -0.05px) rotate(0.005deg);
					filter: blur(0.0001em);
				}
			}

			.earthquake-active {
				position: relative;
				animation: earthquake-shake var(--earthquake-duration, 1.5s) ease-out;
			}

			.earthquake-hero {
				animation: earthquake-intense var(--earthquake-duration, 2s) ease-out;
			}

			/* Intensity variations */
			.earthquake-low {
				--earthquake-intensity: 0.5;
			}

			.earthquake-medium {
				--earthquake-intensity: 1;
			}

			.earthquake-high {
				--earthquake-intensity: 1.5;
			}

			/* Apply intensity scaling to shake effects */
			.earthquake-low.earthquake-active {
				animation: earthquake-shake var(--earthquake-duration, 1.5s) ease-out;
				transform-origin: center;
			}

			.earthquake-high.earthquake-active {
				animation: earthquake-intense var(--earthquake-duration, 1.5s) ease-out;
				transform-origin: center;
			}
		`;
		document.head.appendChild(style);
	}

	function triggerAnimation() {
		if (once && hasAnimated) return;
		if (once && animatedElements.has(node)) return;

		// Set CSS custom properties based on intensity
		const intensityMap = {
			low: { duration: duration * 0.8 },
			medium: { duration },
			high: { duration: duration * 1.2 }
		};
		
		const config = intensityMap[intensity];
		
		node.style.setProperty('--earthquake-duration', `${config.duration}ms`);

		// Dispatch start event
		node.dispatchEvent(new CustomEvent('earthquakeStart', {
			detail: { element: node, intensity, duration: config.duration }
		}));

		// Add animation class
		node.classList.add('earthquake-active', `earthquake-${intensity}`);
		if (trigger === 'immediate') {
			node.classList.add('earthquake-hero');
		}

		// Mark as animated
		hasAnimated = true;
		if (once) {
			animatedElements.add(node);
		}

		// Remove animation after duration
		animationTimeout = window.setTimeout(() => {
			node.classList.remove('earthquake-active', 'earthquake-hero', `earthquake-${intensity}`);
			
			// Dispatch end event
			node.dispatchEvent(new CustomEvent('earthquakeEnd', {
				detail: { element: node, intensity, duration: config.duration }
			}));
		}, config.duration);
	}

	function handleIntersection(entries: IntersectionObserverEntry[]) {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				if (delay > 0) {
					setTimeout(triggerAnimation, delay);
				} else {
					triggerAnimation();
				}
				
				// Disconnect observer if once is true
				if (once && observer) {
					observer.disconnect();
				}
			}
		});
	}

	// Initialize based on trigger type
	if (trigger === 'immediate') {
		if (delay > 0) {
			setTimeout(triggerAnimation, delay);
		} else {
			triggerAnimation();
		}
	} else if (trigger === 'scroll') {
		observer = new IntersectionObserver(handleIntersection, {
			threshold: 0.1,
			rootMargin: '0px 0px -20% 0px'
		});
		observer.observe(node);
	}

	return {
		update(newOptions: EarthquakeOptions) {
			// Handle option updates if needed
			Object.assign(options, newOptions);
		},
		
		destroy() {
			if (animationTimeout) {
				clearTimeout(animationTimeout);
			}
			if (observer) {
				observer.disconnect();
			}
			node.classList.remove('earthquake-active', 'earthquake-hero', 'earthquake-low', 'earthquake-medium', 'earthquake-high');
			animatedElements.delete(node);
		}
	};
}

// Helper function to manually trigger animation
export function triggerEarthquake(element: HTMLElement, options: EarthquakeOptions = {}) {
	const action = earthquakeAnimation(element, { ...options, trigger: 'immediate' });
	return action;
}

// Utility to reset all animations (useful for development)
export function resetAllEarthquakes() {
	animatedElements.clear();
	document.querySelectorAll('.earthquake-active, .earthquake-hero, .earthquake-low, .earthquake-medium, .earthquake-high').forEach(el => {
		el.classList.remove('earthquake-active', 'earthquake-hero', 'earthquake-low', 'earthquake-medium', 'earthquake-high');
	});
}
