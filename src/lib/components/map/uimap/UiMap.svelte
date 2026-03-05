<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { uimapIsMouseOverElementsStore } from './uimap-is-mouse-over-elements.store.js';
	import { uimapPointsMouseover } from './uimap-values.store.js';
	import { isMouseDown, isPointDraggable } from '../map-values.store.js';

	let {
		children
		//longpress
	}: {
		children?: Snippet;
		// longpress?: any;
	} = $props();

	let isMount = $state(false);
	onMount(() => {
		isMount = true;
	});

	$effect(() => {
		if (isMount) {
			if ($uimapIsMouseOverElementsStore.length) {
				$uimapPointsMouseover = true;
				//
			} else {
				$uimapPointsMouseover = false;
			}
		}
	});
	$effect(() => {
		if (isMount) {
			if ($isPointDraggable) {
				document.body.style.cursor = 'grab';
			} else if ($uimapPointsMouseover) {
				document.body.style.cursor = 'pointer';
			} else {
				document.body.style.cursor = 'auto';
			}
		}
	});
	//Перетаскивание
	$effect(() => {
		if (isMount) {
			if ($uimapPointsMouseover && $isMouseDown) {
				$isPointDraggable = true;
			}
			if (!$isMouseDown) {
				$isPointDraggable = false;
			}
		}
	});
	function onContextmenu(e: Event) {
		e.preventDefault();
		// e: MouseEvent
		// onlongpress(e);
	}
</script>

<div class="uimap" oncontextmenu={onContextmenu} role="none">
	<!--class:draggable={$isPointDraggable}-->
	{@render children?.()}
</div>

<style>
	.uimap {
		/* height: 100vh;
		width: 100%; */
		/* display: contents; */
		position: absolute;
		left: 0;
		top: 0;
		z-index: 1;
		/* user-select: none;
		touch-action: none;
		pointer-events: none; */
		/**prevent-select*/
		-webkit-touch-callout: none;
		-webkit-tap-highlight-color: transparent;
		-moz-user-select: -moz-none;
		-webkit-user-select: none; /* Safari */
		-ms-user-select: none; /* IE 10 and IE 11 */
		user-select: none; /* Standard syntax */
	}
	/* .uimap.draggable {
		user-select: inherit;
		touch-action: inherit;
		pointer-events: inherit;
	} */
</style>
