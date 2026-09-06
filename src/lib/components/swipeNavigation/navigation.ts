import { goto } from '$app/navigation';

type Navigator = (url: string) => Promise<void>;

let navigator: Navigator | null = null;

export function registerAppNavigator(fn: Navigator) {
	navigator = fn;

	return () => {
		if (navigator === fn) {
			navigator = null;
		}
	};
}

export async function appGoto(url: string) {
	if (navigator) {
		await navigator(url);
		return;
	}

	await goto(url, {
		replaceState: true,
		noScroll: true,
		keepFocus: true
	});
}
