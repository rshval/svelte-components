declare module 'mapbox-gl/dist/mapbox-gl-csp.js' {
	import type mapboxgl from 'mapbox-gl';

	const mapbox: typeof mapboxgl;

	export default mapbox;
}
