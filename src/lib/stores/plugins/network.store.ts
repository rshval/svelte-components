/**
 * https://capacitorjs.com/docs/apis/network
 */
import type { ConnectionStatus } from '@capacitor/network';
import { Network } from '@capacitor/network';
import { writable } from 'svelte/store';

export const network = writable<ConnectionStatus | null>(null);
export const networkIsInited = writable(false);

export const networkStore = {
	subscribe: network.subscribe,
	initNetwork: async () => {
		const status = await Network.getStatus();
		if (status) network.set(status);
		Network.addListener('networkStatusChange', (status) => {
			network.set(status);
		});
		networkIsInited.set(true);
	}
};

export default networkStore;
