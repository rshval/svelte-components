import { writable } from 'svelte/store';

export const mapIsLoaded = writable<boolean>(false);
export const mapStyleIsLoaded = writable<boolean>(false);
export const isMilesUnit = writable<boolean>(false);
export const isMouseDown = writable<boolean>(false);
export const isPointDraggable = writable<boolean>(false);
export const mapMouseCoordinates = writable<MapComponent.PixelCoordinates>({ x: 0, y: 0 });
export const mapPitchValue = writable<number | null>(null);
export const touchFingersCount = writable<number>(0); // количество пальцев на экране
