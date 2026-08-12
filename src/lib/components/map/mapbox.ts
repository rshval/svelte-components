import mapbox from 'mapbox-gl';

// https://docs.mapbox.com/help/glossary/access-token/
// mapboxgl.config.accessToken = '';
const mapboxWithWorker = mapbox as typeof mapbox & { workerClass: typeof Worker };
mapboxWithWorker.workerClass = class MapboxWorker {
	constructor() {
		return new Worker(new URL('./mapbox-worker.js', import.meta.url), { type: 'module' });
	}
} as unknown as typeof Worker;

const key = {};

export { mapbox, key };
