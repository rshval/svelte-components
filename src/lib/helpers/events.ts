/** Dispatch event on click outside of node */
export function clickOutside(node: HTMLElement, callbackFunction: (event: MouseEvent) => void) {
	const handleClick = (event: MouseEvent) => {
		if (!node.contains(event.target as Node)) {
			callbackFunction(event);
		}
	};

	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}

/** Blurs the node when Escape is pressed */
export function blurOnEscape(node: HTMLElement) {
	const handleKey = (event: KeyboardEvent) => {
		if (event.key === 'Escape' && node && typeof node.blur === 'function') {
			node.blur();
		}
	};

	node.addEventListener('keydown', handleKey);

	return {
		destroy() {
			node.removeEventListener('keydown', handleKey);
		}
	};
}

export default {
	clickOutside: clickOutside,
	blurOnEscape: blurOnEscape
};
