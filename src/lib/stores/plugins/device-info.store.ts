import { writable } from 'svelte/store';
import { Device } from '@capacitor/device';
import type { GetResult } from '@capacitor/preferences';
import { storageGet, storageSet } from '$lib/plugins/storage.js';
import { setHtmlClassList } from '$lib/helpers/functions.js';

export const deviceInfoStore = writable<Plugins.DeviceInfo | null>(null);

deviceInfoStore.subscribe(async (o) => {
	try {
		if (o !== null) {
			if (o.platform) setHtmlClassList(o.platform, ['ios', 'android', 'web']);
			if (o.operatingSystem) {
				const isDesctop = o.operatingSystem !== 'ios' && o.operatingSystem !== 'android';
				o.type = isDesctop ? 'desctop' : 'mobile';
				setHtmlClassList(o.type, ['desctop', 'tablet', 'mobile']);
			}

			storageSet('deviceInfo', JSON.stringify(o));
		}
	} catch (err) {
		console.error(err);
	}
});

export const initDeviceInfo = async () => {
	try {
		const storageDeviceInfo: GetResult | null = await storageGet('deviceInfo'); // 0.26 ms
		const value = storageDeviceInfo?.value;
		if (value && value !== 'null') {
			const val = await JSON.parse(value);
			deviceInfoStore.set(val);
		}
		const deviceInfo: Plugins.DeviceInfo = await Device.getInfo(); // 50 ms
		const identifier = await Device.getId();
		const langCode = await Device.getLanguageCode();
		const langTag = await Device.getLanguageTag();
		const otherParams = {
			identifier: identifier.identifier,
			langCode: langCode.value,
			langTag: langTag.value
		};
		if (JSON.stringify(deviceInfo) !== value) {
			deviceInfoStore.set({ ...deviceInfo, ...otherParams });
		}
	} catch (err) {
		console.error(err);
	}
};
