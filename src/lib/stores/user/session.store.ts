import { get, writable } from 'svelte/store';
import { storageGet, storageSet, storageRemove } from '$lib/plugins/storage.js';
import type { GetResult } from '@capacitor/preferences';

const session = writable<Stores.Session | null | undefined>(undefined);

export const sessionIsInited = writable(false);

export const sessionStore = {
	subscribe: session.subscribe,
	initSession: async () => {
		const dc1_auth_key: GetResult | null = await storageGet('dc1_auth_key');
		const uid: GetResult | null = await storageGet('uid');
		const aid: GetResult | null = await storageGet('aid');
		if (dc1_auth_key?.value && uid?.value && aid?.value) {
			session.set({ dc1_auth_key: dc1_auth_key.value, uid: uid.value, aid: aid.value });
		}
		sessionIsInited.set(true);
	},
	setSession: async (data: Stores.Session) => {
		if (data?.dc1_auth_key && data?.uid && data?.aid) {
			for (const [key, value] of Object.entries(data)) {
				await storageSet(key, value);
			}
			session.set(data);
		}
		return true;
	},
	logout: async () => {
		const data = get(session);
		if (data) {
			for (const [key] of Object.entries(data)) {
				await storageRemove(key);
			}
			session.set(null);
		}
	}
};
