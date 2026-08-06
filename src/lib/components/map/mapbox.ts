import mapbox from 'mapbox-gl/dist/mapbox-gl-csp.js';
import mapboxWorkerUrl from 'mapbox-gl/dist/mapbox-gl-csp-worker.js?url';

// https://docs.mapbox.com/help/glossary/access-token/
// mapboxgl.config.accessToken = '';
const mapboxWithWorker = mapbox as typeof mapbox & { workerUrl: string };
mapboxWithWorker.workerUrl = mapboxWorkerUrl;

const key = {};

export { mapbox, key };
