import { get, writable } from 'svelte/store';

const uimapIsMouseOverElements = writable<MapComponent.MouseOverElement[]>([]);

export const uimapIsMouseOverElementsStore = {
	subscribe: uimapIsMouseOverElements.subscribe,
	addElement: (obj: MapComponent.MouseOverElement) => {
		const elements = get(uimapIsMouseOverElements);
		const isExist = elements.find((i) => i.id === obj.id);
		if (!isExist) {
			uimapIsMouseOverElements.update((items) => {
				const updatedElements = [...items, obj];
				return updatedElements;
			});
		}
	},
	removeElement: (obj: MapComponent.MouseOverElement) => {
		const elements = get(uimapIsMouseOverElements);
		const isExist = elements.find((i) => i.id === obj.id);
		if (isExist) {
			uimapIsMouseOverElements.update((items) => {
				const updatedElements = [...items.filter((i) => i.id !== obj.id)];
				return updatedElements;
			});
		}
	}
};
