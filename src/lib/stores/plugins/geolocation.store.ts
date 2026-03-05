import { BROWSER } from 'esm-env';
import { writable } from 'svelte/store';

let Geolocation: any;

if (BROWSER) {
	initGeolocation();
}

export const geolocationIsWatched = writable(false);
export const geolocationIsInited = writable(false);

function initGeolocation() {
	import('@capacitor/geolocation').then((mod) => {
		if (mod?.Geolocation) {
			Geolocation = mod.Geolocation;
			geolocationIsInited.set(true);
		}
	});
}

let watchId: string; //следим за изменением геопозиции

const geolocation = writable<MapComponent.Geolocation>({ latitude: 0, longitude: 0 });

export const geolocationStore = {
	subscribe: geolocation.subscribe,
	updateLngLat: (longitude: number, latitude: number) => {
		geolocation.update((obj) => {
			return { ...obj, latitude: latitude, longitude: longitude };
		});
	},
	watchGeolocation: async () => {
		await geolocationStore.clearGeolocation();
		watchId = await Geolocation?.watchPosition(
			{
				enableHighAccuracy: true,
				maximumAge: 0
			},
			(data: any) => {
				if (data) {
					geolocation.set(data.coords);
				}
			}
		);
		geolocationIsWatched.set(true);
		return await Geolocation?.getCurrentPosition();
	},
	clearGeolocation: async () => {
		let result;
		if (watchId) {
			result = await Geolocation?.clearWatch({ id: watchId });
			geolocationIsWatched.set(false);
		}
		return result;
	},
	getCurrentPosition: async () => {
		return await Geolocation?.getCurrentPosition();
	},
	isWatched: () => {
		geolocationIsWatched.set(!!watchId);
		return geolocationIsWatched;
	},
	checkPermissions: async () => {
		return await Geolocation?.checkPermissions();
	},
	requestPermissions: async () => {
		return await Geolocation?.requestPermissions();
	}
};
export default geolocationStore;
