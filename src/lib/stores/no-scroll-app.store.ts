import delay from 'delay';
import { setHtmlClassList } from '$lib/helpers/functions.js';
import { writable } from 'svelte/store';

export const noScrollApp = writable<boolean>(false);

export const noScrollAppStore = {
	subscribe: noScrollApp.subscribe,
	setOverflow: async (val: boolean, duration?: number) => {
		await delay(duration ? duration : 0);
		setHtmlClassList(val ? 'no-scroll' : 'scroll', ['no-scroll', 'scroll']);
		noScrollApp.set(val);
	}
};

export default noScrollAppStore;
