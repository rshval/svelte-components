import { get, writable } from 'svelte/store';
import { storageGet, storageSet } from '$lib/plugins/storage.js';
import type { GetResult } from '@capacitor/preferences';

const themes = writable<string[]>([]);
const darkMode = writable<boolean | undefined>();
/**
 * Включенный режим - меняет стиль карты и интерфейса.
 */
const darkModeStore = {
	subscribe: darkMode.subscribe,
	initDarkMode: async (arr: string[]) => {
		themes.set(arr);
		const storageDarkMode: GetResult | null = await storageGet('darkMode');
		let result;
		if (storageDarkMode?.value === 'true' || storageDarkMode?.value === 'false') {
			result = Boolean(storageDarkMode.value === 'true');
		} else {
			result = null;
		}

		if (get(themes)?.length > 1) {
			if (result !== null) {
				document.documentElement.setAttribute(
					'data-theme',
					result ? get(themes)[1] : get(themes)[0]
				);
				darkModeStore.setDarkMode(result);
			} else {
				const themeMatched = window.matchMedia('(prefers-color-scheme: dark)').matches;
				darkModeStore.setDarkMode(themeMatched);
			}
		} else if (get(themes)?.length === 1) {
			document.documentElement.setAttribute('data-theme', get(themes)[0]);
			darkModeStore.setDarkMode(false);
		}
	},
	setDarkMode: async (val: boolean) => {
		await storageSet('darkMode', String(val));
		darkMode.set(val);
		if (get(themes)?.length > 1) {
			document.documentElement.setAttribute('data-theme', val ? get(themes)[1] : get(themes)[0]);
		} else if (get(themes)?.length === 1) {
			document.documentElement.setAttribute('data-theme', get(themes)[0]);
		}
	}
};

export default darkModeStore;
