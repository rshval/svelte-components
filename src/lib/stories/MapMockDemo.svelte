<script lang="ts">
	import { get } from 'svelte/store';
	import { onDestroy, onMount } from 'svelte';
	import MapCtrls from '../components/map/ctrls/MapCtrls.svelte';
	import MapCtrlScale from '../components/map/ctrls/MapCtrlScale.svelte';
	import UiMap from '../components/map/uimap/UiMap.svelte';
	import UiMapCenterPoint from '../components/map/uimap/UiMapCenterPoint.svelte';
	import UiMapPoint from '../components/map/uimap/UiMapPoint.svelte';
	import UiMapPointDetail from '../components/map/uimap/UiMapPointDetail.svelte';
	import UiMapUserPoint from '../components/map/uimap/UiMapUserPoint.svelte';
	import { mapIsLoaded, mapStyleIsLoaded } from '../components/map/map-values.store.js';
	import { geolocationStore } from '../stores/plugins/geolocation.store.js';

	let {
		variant = 'full'
	}: {
		variant?:
			'full' | 'component' | 'ctrls' | 'scale' | 'uimap' | 'center' | 'point' | 'detail' | 'user';
	} = $props();

	type Handler = (...args: any[]) => void;
	const handlers = new Map<string, Set<Handler>>();

	const mockMap = {
		dragRotate: {
			disable() {},
			enable() {}
		},
		on(event: string, handler: Handler) {
			const eventHandlers = handlers.get(event) ?? new Set<Handler>();
			eventHandlers.add(handler);
			handlers.set(event, eventHandlers);
			return mockMap;
		},
		off(event: string, handler: Handler) {
			handlers.get(event)?.delete(handler);
			return mockMap;
		},
		fire(event: string, payload?: unknown) {
			handlers.get(event)?.forEach((handler) => handler(payload));
			return mockMap;
		},
		project(coordinates: [number, number] | { lng: number; lat: number }) {
			const lng = Array.isArray(coordinates) ? coordinates[0] : coordinates.lng;
			const lat = Array.isArray(coordinates) ? coordinates[1] : coordinates.lat;
			return {
				x: 250 + (lng - 49.12) * 260,
				y: 210 - (lat - 55.78) * 260
			};
		},
		unproject([x, y]: [number, number]) {
			return {
				lng: 49.12 + (x - 250) / 260,
				lat: 55.78 - (y - 210) / 260
			};
		},
		getCenter() {
			return { lng: 49.12, lat: 55.78 };
		},
		getZoom() {
			return 14;
		},
		getPitch() {
			return 0;
		},
		zoomIn() {
			mockMap.fire('zoom');
		},
		zoomOut() {
			mockMap.fire('zoom');
		},
		easeTo() {
			mockMap.fire('move');
			mockMap.fire('moveend');
		},
		flyTo() {
			mockMap.fire('move');
			mockMap.fire('flyend');
		}
	} as any;

	const point = { longitude: 49.18, latitude: 55.81 };
	let detailAnchor: HTMLButtonElement | undefined = $state();
	const initialMapIsLoaded = get(mapIsLoaded);
	const initialMapStyleIsLoaded = get(mapStyleIsLoaded);
	const initialGeolocation = get(geolocationStore);

	onMount(() => {
		mapIsLoaded.set(true);
		mapStyleIsLoaded.set(true);
		geolocationStore.updateLngLat(49.1, 55.76);
	});

	onDestroy(() => {
		mapIsLoaded.set(initialMapIsLoaded);
		mapStyleIsLoaded.set(initialMapStyleIsLoaded);
		geolocationStore.updateLngLat(initialGeolocation.longitude, initialGeolocation.latitude);
	});
</script>

<div
	class="mock-map relative min-h-[420px] overflow-hidden rounded-box border border-base-300 bg-base-200"
>
	<div class="mock-map__grid"></div>
	<div class="absolute top-4 left-4 rounded-box bg-base-100/90 px-3 py-2 text-sm shadow">
		{variant === 'component' ? 'MapComponent token state' : 'Map UI demo'}
	</div>

	{#if variant === 'component'}
		<div
			class="absolute inset-x-6 bottom-6 rounded-box border border-warning bg-warning/10 p-4 text-sm"
		>
			MapComponent needs a Mapbox access token. This story keeps the canvas stable and shows the
			expected empty-token state instead of throwing in Storybook.
		</div>
	{:else}
		{#if variant === 'full' || variant === 'scale'}
			<MapCtrlScale map={mockMap} />
		{/if}

		{#if variant === 'full' || variant === 'ctrls'}
			<MapCtrls map={mockMap} buttonNavigate buttonPitch />
		{/if}

		{#if variant === 'full' || variant === 'uimap' || variant === 'center' || variant === 'point' || variant === 'user'}
			<UiMap>
				{#if variant === 'full' || variant === 'center' || variant === 'uimap'}
					<UiMapCenterPoint map={mockMap} />
				{/if}

				{#if variant === 'full' || variant === 'point' || variant === 'uimap'}
					<UiMapPoint map={mockMap} geolocation={point} isShowDetail={variant === 'point'}>
						{#snippet iconSnippet()}
							<div class="rounded-full bg-primary px-3 py-2 text-primary-content shadow">A</div>
						{/snippet}
						{#snippet detailsSnippet()}
							<div class="rounded-box bg-base-100 p-3 shadow">
								<p class="font-medium">Dock A</p>
								<p class="text-sm opacity-70">Ready for pickup</p>
							</div>
						{/snippet}
					</UiMapPoint>
				{/if}

				{#if variant === 'full' || variant === 'user' || variant === 'uimap'}
					<UiMapUserPoint map={mockMap} noClick={variant !== 'user'} />
				{/if}
			</UiMap>
		{/if}

		{#if variant === 'detail'}
			<button
				bind:this={detailAnchor}
				type="button"
				class="btn absolute top-1/2 left-1/2 btn-primary"
			>
				Point
			</button>
			<UiMapPointDetail element={detailAnchor} x={280} y={190}>
				<div class="rounded-box bg-base-100 p-3 shadow">
					<p class="font-medium">Point details</p>
					<p class="text-sm opacity-70">Standalone popup placement.</p>
				</div>
			</UiMapPointDetail>
		{/if}
	{/if}
</div>

<style>
	.mock-map__grid {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(
				90deg,
				color-mix(in oklab, var(--color-base-300), transparent 30%) 1px,
				transparent 1px
			),
			linear-gradient(
				color-mix(in oklab, var(--color-base-300), transparent 30%) 1px,
				transparent 1px
			),
			radial-gradient(circle at 62% 38%, var(--color-info) 0 2px, transparent 3px),
			radial-gradient(circle at 48% 55%, var(--color-primary) 0 2px, transparent 3px);
		background-size:
			48px 48px,
			48px 48px,
			100% 100%,
			100% 100%;
	}
</style>
