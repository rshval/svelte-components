<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { animationDuration } from '$lib/constants.js';
	import type { Map } from 'mapbox-gl';

	import { deviceInfoStore } from '$lib/stores/plugins/device-info.store.js';
	import { geolocationStore } from '$lib/stores/plugins/geolocation.store.js';

	import IconPlus from '@tabler/icons-svelte-runes/icons/plus';
	import IconMinus from '@tabler/icons-svelte-runes/icons/minus';
	import IconLocation from '@tabler/icons-svelte-runes/icons/location';
	import Button from '$lib/components/Button.svelte';

	import { mapPitchValue } from '../map-values.store.js';
	import { getGeolocation } from '../map-functions.js';

	let {
		map,
		buttonNavigate,
		buttonPitch
	}: { map: Map; buttonNavigate?: boolean; buttonPitch?: boolean } = $props();

	let isMount = $state(false);

	onMount(() => {
		isMount = true;
	});

	$effect(() => {
		if (map && isMount) {
			map.dragRotate.disable();
		}
	});

	onDestroy(() => {
		if (map) map.dragRotate.enable();
	});

	/**
	 * Приближение и отдоление
	 * @param value
	 */
	function zoomIn() {
		if (map) map.zoomIn();
	}
	function zoomOut() {
		if (map) map.zoomOut();
	}

	let isStatement: boolean = $state(false);
	async function doNavigate() {
		isStatement = await getGeolocation();
		if (isStatement) {
			if (map) mapFlyTo();
		} else {
			map?.fire?.('denied');
		}
	}
	async function mapFlyTo(zoom?: number) {
		zoom = zoom || 16;
		try {
			const lonLat = $geolocationStore;
			if (map && typeof lonLat.longitude === 'number' && lonLat.longitude !== 0) {
				const currentZoom = map.getZoom() >= zoom ? map.getZoom() : zoom;
				map.flyTo({
					center: [lonLat.longitude, lonLat.latitude],
					zoom: currentZoom
				});
			}
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * 3d и 2d режим
	 */
	let pitch: MapComponent.Pitch = {
		'2d': 0,
		'3d': 65
	};
	let newPitchName = $state('3d'.toUpperCase());

	function setPitch() {
		if (map) {
			let currentPitch = map.getPitch();
			let newPitch = currentPitch === 0 ? pitch['3d'] : pitch['2d'];
			newPitchName = (
				Object.keys(pitch).find((key) => pitch[key] !== newPitch) || '3d'
			).toUpperCase();
			$mapPitchValue = newPitch;
			map.easeTo({
				pitch: newPitch,
				duration: animationDuration * 2
			});
		}
	}
</script>

{#if $deviceInfoStore?.type === 'desctop'}
	<Button class="absolute right-1 z-40 btn-circle btn-soft" style="top: 40%" onclick={zoomIn}
		><IconPlus size={19} /></Button
	>

	<Button
		class="absolute right-1 z-40 btn-circle btn-soft"
		style="top: calc(40% + 50px);"
		onclick={zoomOut}><IconMinus size={19} /></Button
	>
{/if}
{#if buttonNavigate}
	<Button
		class="absolute right-1 z-40 btn-circle btn-soft"
		style="top: calc(40% + {$deviceInfoStore?.type === 'desctop' ? 100 : 0}px);"
		onclick={doNavigate}
	>
		<IconLocation size={17} />
	</Button>
{/if}
{#if buttonPitch}
	<Button
		class="absolute right-1 z-40 btn-circle text-sm! btn-soft"
		style="top: calc(40% + {$deviceInfoStore?.type === 'desctop' ? 150 : 50}px);"
		onclick={setPitch}>{newPitchName}</Button
	>
{/if}
