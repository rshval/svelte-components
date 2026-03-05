import { writable } from 'svelte/store';

export const isOpenedDrawer = writable<boolean>(false);
