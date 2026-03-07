import { get, writable } from 'svelte/store';
import { storageGet, storageSet } from '$lib/plugins/storage.js';
import type { GetResult } from '@capacitor/preferences';

const themes = writable<string[]>([]);
const darkMode = writable<boolean | undefined>();
let mediaQuery: MediaQueryList | null = null;
let systemThemeListener: ((event: MediaQueryListEvent) => void) | null = null;
let hasUserPreference = false;

function applyTheme(val: boolean) {
	if (get(themes)?.length > 1) {
		document.documentElement.setAttribute('data-theme', val ? get(themes)[1] : get(themes)[0]);
	} else if (get(themes)?.length === 1) {
		document.documentElement.setAttribute('data-theme', get(themes)[0]);
	}
}

function parseDarkMode(value: string | null | undefined) {
	if (value === 'true') return true;
	if (value === 'false') return false;
	return null;
}

function initSystemThemeWatcher() {
	if (!window.matchMedia) {
		return;
	}

	mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

	systemThemeListener = (event: MediaQueryListEvent) => {
		if (hasUserPreference) {
			return;
		}

		darkMode.set(event.matches);
		applyTheme(event.matches);
	};

	mediaQuery.addEventListener('change', systemThemeListener);
}

function removeSystemThemeWatcher() {
	if (mediaQuery && systemThemeListener) {
		mediaQuery.removeEventListener('change', systemThemeListener);
	}

	mediaQuery = null;
	systemThemeListener = null;
}
/**
 * Включенный режим - меняет стиль карты и интерфейса.
 */
const darkModeStore = {
	subscribe: darkMode.subscribe,
	initDarkMode: async (arr: string[]) => {
		themes.set(arr);

		const storageDarkMode: GetResult | null = await storageGet('darkMode');
		const result = parseDarkMode(storageDarkMode?.value);
		hasUserPreference = result !== null;

		removeSystemThemeWatcher();

		if (get(themes)?.length > 1) {
			if (result !== null) {
				darkMode.set(result);
				applyTheme(result);
			} else {
				const themeMatched = window.matchMedia
					? window.matchMedia('(prefers-color-scheme: dark)').matches
					: false;
				darkMode.set(themeMatched);
				applyTheme(themeMatched);
				initSystemThemeWatcher();
			}
		} else if (get(themes)?.length === 1) {
			darkMode.set(false);
			applyTheme(false);
		}
	},
	setDarkMode: async (val: boolean) => {
		hasUserPreference = true;
		removeSystemThemeWatcher();
		await storageSet('darkMode', String(val));
		darkMode.set(val);
		applyTheme(val);
	}
};

export default darkModeStore;
