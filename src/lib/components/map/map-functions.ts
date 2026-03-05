import geolocationStore, { geolocationIsWatched } from '$lib/stores/plugins/geolocation.store.js';
import delay from 'delay';
import { get } from 'svelte/store';

export const getGeolocation: any = async () => {
	const permissions = await geolocationStore.checkPermissions();
	if (permissions?.location === 'denied') {
		return null;
	} else {
		if (!permissions) {
			await delay(200);
			return getGeolocation();
		} else {
			if (!get(geolocationIsWatched)) {
				await geolocationStore.watchGeolocation();
			}
			return get(geolocationStore);
		}
	}
};
