/**
 * модуль storage использует Preferences API
 * для постоянного хранилища ключей и значений для облегченных данных.
 * (заявлена кросплатформенность web|ios|android)
 * https://capacitorjs.com/docs/apis/preferences
 */

import { Preferences } from '@capacitor/preferences';

export async function storageSet(key: string, value: string) {
	try {
		const result = await Preferences.set({ key: key, value: value });
		return result;
	} catch {
		return null;
	}
}

export async function storageGet(key: string) {
	try {
		const result = await Preferences.get({ key: key });
		return result;
	} catch {
		return null;
	}
}

export async function storageRemove(key: string) {
	try {
		await Preferences.remove({ key: key });
		return true;
	} catch {
		return false;
	}
}
