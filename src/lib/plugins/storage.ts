/**
 * The storage module uses Preferences API
 * for persistent key-value storage of lightweight data.
 * Cross-platform behavior for web/iOS/Android is expected.
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
