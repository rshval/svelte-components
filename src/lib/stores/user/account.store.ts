import { get, writable } from 'svelte/store';
import api from '$lib/plugins/api.js';
import { sessionStore } from './session.store.js';

const account = writable<Models.User | null | undefined>(undefined);

export const accountStoreInited = writable(false);

export const accountStore = {
	subscribe: account.subscribe,
	initAccount: async (API_BASE: string) => {
		const session = await get(sessionStore);
		if (session) {
			const response = await api.get(`${API_BASE}/user/${session?.uid}`, session?.dc1_auth_key);
			if (response?.user) {
				account.set(response?.user);
			} else {
				accountStore.logout();
				sessionStore.logout();
			}
			accountStoreInited.set(true);
		}
	},
	setAccount: async (data: Models.User) => {
		if (data?._id) {
			account.set(data);
		}
	},
	logout: async () => {
		const data = get(account);
		if (data) {
			account.set(null);
		}
	}
};
