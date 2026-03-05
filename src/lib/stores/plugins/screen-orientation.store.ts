import { ScreenOrientation } from '@capacitor/screen-orientation';
import type { OrientationLockType } from '@capacitor/screen-orientation';

import { writable } from 'svelte/store';

const screenOrientation = writable<OrientationLockType | undefined>(undefined);

export const screenOrientationStore = {
	subscribe: screenOrientation.subscribe,
	initOrientation: async () => {
		const result = await ScreenOrientation.orientation();
		screenOrientation.set(result.type);
		ScreenOrientation.addListener('screenOrientationChange', (result) => {
			screenOrientation.set(result.type);
		});
	}
};

export default screenOrientationStore;
