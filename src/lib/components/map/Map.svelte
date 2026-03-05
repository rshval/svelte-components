<script lang="ts">
	import type { Map as MapType, MapMouseEvent, MapTouchEvent } from 'mapbox-gl';
	import { onMount } from 'svelte';
	import mapStylesList from './map-styles-list.js';
	import { geolocationStore } from '$lib/stores/plugins/geolocation.store.js';
	import darkModeStore from '$lib/components/theme/dark-mode.store.js';
	import { storageGet } from '$lib/plugins/storage.js';
	import { defaultInitialCenter } from '$lib/constants.js';

	import {
		UiMap,
		MapComponent,
		MapCtrls,
		UiMapUserPoint,
		MapCtrlScale,
		uimapPointsMouseover
	} from './index.js';
	import type { GetResult } from '@capacitor/preferences';

	let {
		uiSnippet,
		accessToken = '',
		map = $bindable(),
		showUI = true,
		showScale = false,
		zoom = 15,
		maxZoom = 17,
		initialCenter = defaultInitialCenter,
		clickCoordinates,
		buttonNavigate,
		buttonPitch,
		...props
	}: {
		uiSnippet?: any;
		accessToken: string;
		map?: MapType | undefined;
		showUI?: boolean;
		showScale?: boolean;
		zoom?: number;
		maxZoom?: number;
		initialCenter?: MapComponent.Coordinates;
		clickCoordinates?: MapComponent.Coordinates;
		buttonNavigate?: boolean;
		buttonPitch?: boolean;
		onmoveend?: any;
		onclick?: any;
		ondenied?: any;
	} = $props();

	// svelte-ignore non_reactive_update
	let lng = defaultInitialCenter?.lng;
	// svelte-ignore non_reactive_update
	let lat = defaultInitialCenter?.lat;

	$effect(() => {
		if (initialCenter?.lat !== lat) lat = initialCenter.lat;
		if (initialCenter?.lng !== lng) lng = initialCenter.lng;
	});
	$effect(() => {
		let geo = $geolocationStore;
		if (geo?.longitude && lng !== geo.longitude) lng = geo.longitude;
		if (geo?.latitude && lat !== geo.latitude) lat = geo.latitude;
	});

	let mapStyleId: string | undefined = $state();

	$effect(() => {
		if ($darkModeStore || !$darkModeStore) getMapStyle();
	});

	async function getMapStyle() {
		let value;
		let values = ['light', 'dark'];
		if (typeof $darkModeStore === 'boolean') {
			value = !$darkModeStore ? values[0] : values[1];
		}
		if (!value) {
			const storageDarkMode: GetResult | null = await storageGet('darkMode');
			if (storageDarkMode?.value === 'true' || storageDarkMode?.value === 'false') {
				value = storageDarkMode?.value === 'true' ? values[1] : values[0];
			} else {
				value = values[0];
			}
		}
		mapStyleId = mapStylesList.mapStyles.find((s) => s.id === value)?.id;
	}

	// $effect(()=>{

	let showPoints = $state(false);
	onMount(() => {
		setTimeout(() => {
			showPoints = true;
		}, 500);
	});

	function onMapClick(originalEvent: MapMouseEvent) {
		props.onclick?.(originalEvent);
	}

	function onMapDblClick(event: MapMouseEvent | MapTouchEvent | CustomEvent) {
		const mapEvent = 'detail' in event ? event.detail : event;
		if ($uimapPointsMouseover) {
			mapEvent.preventDefault();
		}
	}

	function onMapLongpress() {}

	function onMapMoveend(originalEvent: Event) {
		props.onmoveend?.(originalEvent);
	}

	function onMapMouseup() {}
	function onMapTouchend() {}
</script>

<div
	class="map__wrap relative flex h-full min-h-full w-full max-w-full flex-1 flex-col overflow-hidden"
>
	{#if mapStyleId}
		<MapComponent
			{accessToken}
			bind:map
			onclick={onMapClick}
			onmoveend={onMapMoveend}
			ondblclick={onMapDblClick}
			onlongpress={onMapLongpress}
			ontouchend={onMapTouchend}
			onmouseup={onMapMouseup}
			{lng}
			{lat}
			{zoom}
			{maxZoom}
			mapStyle={mapStylesList.mapStyles.find((s) => s.id === mapStyleId)}
		>
			{#if showUI && showScale}
				<MapCtrlScale {map} />
			{/if}
		</MapComponent>
		<UiMap>
			{#if showPoints}
				<UiMapUserPoint {map} noClick />
			{/if}
			{#if uiSnippet && showPoints}
				{@render uiSnippet?.()}
			{/if}
		</UiMap>
		{#if showUI && map}
			<MapCtrls {map} {buttonNavigate} {buttonPitch} />
		{/if}
	{/if}
</div>
