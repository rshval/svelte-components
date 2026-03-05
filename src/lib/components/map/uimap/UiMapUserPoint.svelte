<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';
	import type { LngLatLike, Map } from 'mapbox-gl';
	import { animationDuration } from '$lib/constants.js';
	import UiMapPointDetail from './UiMapPointDetail.svelte';
	import { geolocationStore } from '$lib/stores/plugins/geolocation.store.js';
	import { mapPitchValue } from '../map-values.store.js';
	import IconUser from '@tabler/icons-svelte-runes/icons/user';

	let {
		map,
		noClick
	}: {
		map: Map | undefined;
		noClick: boolean;
	} = $props();

	let pointType = 'standing';
	let width = $state(0);
	let height = $state(0);
	let pixelCoordinates: MapComponent.PixelCoordinates = $state({ x: 0, y: 0 });

	let isMount = $state(false);
	onMount(() => {
		isMount = true;
	});

	$effect(() => {
		if (map && isMount) {
			map.on('move', handleMove);
		}
	});

	let isHidden = $state(true);
	$effect(() => {
		if (
			isMount &&
			typeof $geolocationStore.longitude === 'number' &&
			$geolocationStore.longitude !== 0
		) {
			handleMove();
			isHidden = false;
		} else {
			isHidden = true;
		}
	});

	let x = $state(0);
	$effect(() => {
		x = (pixelCoordinates.x ? pixelCoordinates.x : 0) - width / 2;
	});
	let y = $state(0);
	$effect(() => {
		y = (pixelCoordinates.y ? pixelCoordinates.y : 0) - height / 2;
	});

	onDestroy(() => {
		if (map) map.off('move', handleMove);
	});

	// обработчик события изменения пиксельных координат
	function handleMove() {
		const lonLat = $geolocationStore;
		if (map && lonLat) {
			if (typeof lonLat.longitude === 'number' && lonLat.longitude !== 0) {
				let coordinates: LngLatLike = [lonLat.longitude, lonLat.latitude];
				pixelCoordinates = map.project(coordinates);
			}
		}
	}

	let timeoutToggleId: ReturnType<typeof setTimeout>;
	let isShowPointDetail = $state(false);
	function toggleShowDetail() {
		if (!noClick) {
			if (timeoutToggleId) clearTimeout(timeoutToggleId);
			timeoutToggleId = setTimeout(() => {
				isShowPointDetail = !isShowPointDetail;
			}, 50);
		}
	}

	let userPointElement: HTMLElement | undefined = $state();
</script>

{#if !isHidden}
	<div
		class="user-point z-50"
		onclick={toggleShowDetail}
		role="none"
		bind:this={userPointElement}
		tabindex="-1"
		in:fade|local={{
			duration: animationDuration
		}}
		onkeypress={() => {}}
		bind:offsetHeight={height}
		bind:offsetWidth={width}
		style="transform: translate({x}px, {y}px);"
	>
		<div class="tooltip tooltip-info" data-tip="Вы здесь">
			{#if pointType === 'standing'}
				<div
					class="user-icon border border-base-300"
					style={$mapPitchValue ? 'transform: rotateX(' + $mapPitchValue + 'deg) scale(0.9);}' : ''}
				>
					<IconUser size={16} />
				</div>
			{:else}
				<div
					class="user-icon border border-base-300"
					style={$mapPitchValue ? 'transform: rotateX(' + $mapPitchValue + 'deg) scale(0.9);}' : ''}
				>
					<IconUser size={16} />
				</div>
			{/if}
		</div>
	</div>
{/if}
{#if isShowPointDetail && !noClick}
	<div in:fade|local={{ duration: animationDuration }}>
		<UiMapPointDetail element={userPointElement} x={pixelCoordinates.x} y={pixelCoordinates.y}>
			<div class="details">123</div>
		</UiMapPointDetail>
	</div>
{/if}

<style>
	.user-point {
		position: absolute;
		width: max-content;
		cursor: pointer;
	}
	.user-icon {
		padding: 5px;
		border-radius: 50%;
		background-color: var(--color-info);
		box-shadow: 0px 0px 5px var(--color-base-300);
		transition:
			transform calc(var(--transition-time) * 2) ease-out,
			background-color var(--transition-time) ease-out,
			border var(--transition-time) ease-out;
	}
	.details {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		/* font-size: 1.1em; */
		margin: 0.6em;
	}
</style>
