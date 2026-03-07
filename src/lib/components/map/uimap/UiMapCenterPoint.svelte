<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { onMount, onDestroy, type Snippet } from 'svelte';
	import type { LngLatLike, Map } from 'mapbox-gl';
	import { animationDuration } from '$lib/constants.js';

	let {
		bgOne = 'bg-accent',
		bgTwo = 'bg-accent',
		children,
		map
	}: {
		bgOne?: string;
		bgTwo?: string;
		children?: Snippet;
		map: Map | undefined;
	} = $props();

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
			map.on('moveend', handleMoveend);
		}
	});

	let isHidden = $state(true);
	$effect(() => {
		if (isMount) {
			handleMove();
			isHidden = false;
		} else {
			isHidden = true;
		}
	});

	let x = $state(0);
	$effect(() => {
		x = (pixelCoordinates.x ? pixelCoordinates.x : 0) - width / 2 + 1;
	});
	let y = $state(0);
	$effect(() => {
		y = (pixelCoordinates.y ? pixelCoordinates.y : 0) - height + 2;
	});

	onDestroy(() => {
		if (map) {
			map.off('move', handleMove);
			map.off('moveend', handleMoveend);
		}
	});

	// обработчик события изменения пиксельных координат
	function handleMove() {
		isTweened = true;
		tween.target = 1;
		const currentCoords = map?.getCenter();
		if (map && currentCoords) {
			if (typeof currentCoords.lng === 'number' && currentCoords.lng !== 0) {
				let coordinates: LngLatLike = [currentCoords.lng, currentCoords.lat];
				pixelCoordinates = map.project(coordinates);
			}
		}
	}
	let centerPointElement: HTMLElement | undefined = $state();

	//start animation
	const tween = new Tween(0, {
		duration: 400,
		easing: cubicOut
	});
	let isTweened = $state(false);
	function handleMoveend() {
		isTweened = false;
		tween.target = 0;
	}
	//end animation
</script>

{#if !isHidden}
	<div
		class="absolute z-60 w-max"
		role="none"
		bind:this={centerPointElement}
		tabindex="-1"
		in:fade|local={{
			duration: animationDuration
		}}
		bind:offsetHeight={height}
		bind:offsetWidth={width}
		style="transform: translate({x}px, {y}px);"
	>
		{#if children}
			{@render children?.()}
		{:else}
			<div
				class="relative flex flex-col items-center justify-center"
				style="margin-top: calc(-10px * {tween.current});margin-bottom: calc(10px * {tween.current})"
			>
				<div class="{bgOne} z-30 flex h-10 w-10 items-center justify-center rounded-4xl">
					<div
						class="rounded-4xl {tween.current > 0.1 && tween.current < 0.2
							? 'bg-base-200'
							: 'bg-base-100'}"
						style="width:calc(13px + (3px * {tween.current})); height:calc(13px + (3px * {tween.current}))"
					></div>
				</div>
				<div class="{bgTwo} z-20 -mt-1 h-5 w-1 rounded-4xl"></div>
			</div>
			<div class="relative flex flex-col items-center justify-center">
				<div
					class="z-10 -mt-1 h-2 w-2 rounded-4xl bg-base-300"
					style="transform: rotateX(70deg) scale(1.2); opacity:calc(0.5 + {tween.current} / 2)"
				></div>
			</div>
		{/if}
	</div>
{/if}
