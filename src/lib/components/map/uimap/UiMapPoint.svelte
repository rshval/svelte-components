<script lang="ts">
	import type { LngLatLike, Map } from 'mapbox-gl';
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { clickOutside } from '$lib/helpers/events.js';
	import UiMapPointDetail from './UiMapPointDetail.svelte';
	import { animationDuration } from '$lib/constants.js';
	import { mapPitchValue } from '../map-values.store.js';

	let {
		iconSnippet,
		detailsSnippet,
		map,
		geolocation,
		class: className,
		classPoint,
		isShowDetail = $bindable(),
		onselect,
		ontoggle
	}: {
		iconSnippet?: any;
		detailsSnippet?: any;
		map: Map | undefined;
		geolocation: { longitude: number; latitude: number };
		class?: any;
		classPoint?: any;
		isShowDetail?: boolean;
		selected?: boolean;
		onselect?: any;
		ontoggle?: any;
	} = $props();

	// needed so `value` is correct during the child's initialization
	if (isShowDetail === undefined) isShowDetail = false;
	$effect(() => {
		if (isShowDetail === undefined) isShowDetail = false;
	});

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
			map.on('flyend', handleFlyEnd);
		}
	});

	let isHidden = $state(true);
	$effect(() => {
		if (isMount && typeof geolocation.longitude === 'number' && geolocation.longitude !== 0) {
			handleMove();
			isHidden = false;
		} else {
			isHidden = true;
		}
	});

	let x = $state(0);
	let y = $state(0);
	$effect(() => {
		x = (pixelCoordinates.x ? pixelCoordinates.x : 0) - width / 2;
	});
	$effect(() => {
		y = (pixelCoordinates.y ? pixelCoordinates.y : 0) - height / 2;
	});

	onDestroy(() => {
		if (map) map.off('move', handleMove);
		if (map) map.off('flyend', handleFlyEnd);
		isShowDetail = false;
	});

	// обработчик события изменения пиксельных координат
	function handleMove() {
		const lonLat = geolocation;
		if (map && lonLat) {
			if (typeof lonLat.longitude === 'number' && lonLat.longitude !== 0) {
				let coordinates: LngLatLike = [lonLat.longitude, lonLat.latitude];
				pixelCoordinates = map.project(coordinates);
			}
		}
	}

	let doFly = false;
	function handleClick() {
		onselect?.(true);
		doFly = true;
		map?.flyTo({
			center: [geolocation.longitude, geolocation.latitude]
		});
	}

	function handleFlyEnd() {
		if (doFly) {
			toggleShowDetail();
		}
	}

	let timeoutToggleId: ReturnType<typeof setTimeout>;
	function toggleShowDetail() {
		doFly = false;
		if (timeoutToggleId) clearTimeout(timeoutToggleId);
		timeoutToggleId = setTimeout(() => {
			isShowDetail = isShowDetail === false ? true : false;
		}, 50);
	}

	$effect(() => {
		if (ontoggle) ontoggle(isShowDetail);
	});

	let pointElement: HTMLElement | undefined = $state();

	function handleClickOutside() {
		setTimeout(() => {
			if (isShowDetail) toggleShowDetail();
		}, 50);
	}
</script>

{#if !isHidden}
	<div
		class={['point', classPoint]}
		class:z-30={isShowDetail}
		onclick={handleClick}
		role="none"
		bind:this={pointElement}
		tabindex="-1"
		onkeypress={() => {}}
		in:fade|local={{
			duration: animationDuration
		}}
		bind:offsetHeight={height}
		bind:offsetWidth={width}
		style="transform: translate({x}px, {y}px);"
	>
		{#if pointType === 'standing'}
			<div
				class={['icon', className]}
				style={$mapPitchValue ? 'transform: rotateX(' + $mapPitchValue + 'deg) scale(0.9);}' : ''}
			>
				{#if iconSnippet}
					{@render iconSnippet?.()}
				{/if}
			</div>
		{:else}
			<div
				class={['icon', className]}
				style={$mapPitchValue ? 'transform: rotateX(' + $mapPitchValue + 'deg) scale(0.9);}' : ''}
			>
				{#if iconSnippet}
					{@render iconSnippet?.()}
				{/if}
			</div>
		{/if}
	</div>
{/if}
{#if isShowDetail}
	<div
		class="details-wrap"
		in:fade|local={{ duration: animationDuration }}
		use:clickOutside={handleClickOutside}
	>
		<UiMapPointDetail element={pointElement} x={pixelCoordinates.x} y={pixelCoordinates.y}>
			<div class="details">
				{#if detailsSnippet}
					{@render detailsSnippet?.()}
				{/if}
			</div>
		</UiMapPointDetail>
	</div>
{/if}

<style>
	.point {
		position: absolute;
		width: max-content;
		cursor: pointer;
	}
	.icon {
		min-width: 1.25em;
		min-height: 1.25em;
		transition:
			transform calc(var(--transition-time) * 2) ease-out,
			background-color var(--transition-time) ease-out,
			border var(--transition-time) ease-out;
	}
	.details-wrap {
		z-index: 3;
		position: relative;
	}
	.details {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		margin: 0.6em;
		z-index: 3;
	}
</style>
