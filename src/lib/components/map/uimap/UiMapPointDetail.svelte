<script lang="ts">
	import type { Snippet } from 'svelte';
	import { clickOutside } from '$lib/helpers/events.js';
	import Popup from '$lib/components/Popup.svelte';

	let {
		children,
		x = 0,
		y = 0,
		element,
		onclose
	}: {
		children?: Snippet;

		x?: number | undefined;
		y?: number | undefined;
		element: HTMLElement | undefined;
		onclose?: any;
	} = $props();

	let pointDetailElement: HTMLElement | undefined = $state();
	let pointDetailsHeight: number = $state(0);

	function handleClickOutside(e: MouseEvent) {
		onclose?.(e);
	}
</script>

<div
	use:clickOutside={handleClickOutside}
	bind:this={pointDetailElement}
	class="point-detail"
	bind:offsetHeight={pointDetailsHeight}
	style="transform: translate({x}px, {y}px);"
>
	<Popup placement="top" target={element ? element : pointDetailElement}>
		{@render children?.()}
	</Popup>
</div>

<style>
	.point-detail {
		position: absolute;
		z-index: 2;
		top: 0;
		padding: 1em 0;
		box-sizing: border-box;
		left: 0;
		pointer-events: all;
	}
</style>
