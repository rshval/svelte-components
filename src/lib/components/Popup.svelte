<script lang="ts">
	import type { Snippet } from 'svelte';
	import { clickOutside } from '$lib/helpers/events.js';
	import createPopperAction from '$lib/helpers/usePopper.js';
	import { createId } from '$lib/helpers/id.js';

	let {
		children,
		class: className,
		element = $bindable(),
		target,
		placement = 'bottom',
		zIndex = 2,
		...props
	}: {
		children?: Snippet;
		class?: any;
		element?: HTMLElement | undefined | null;
		target?: HTMLElement | undefined | null;
		placement?:
			| 'top'
			| 'top-start'
			| 'top-end'
			| 'bottom'
			| 'bottom-start'
			| 'bottom-end'
			| 'right'
			| 'right-start'
			| 'right-end'
			| 'left'
			| 'left-start'
			| 'left-end';
		zIndex?: number;
		onclose?: any;
	} = $props();

	const [usePopperElement, usePopperToolip] = createPopperAction();

	$effect(() => {
		if (target) {
			usePopperElement(target);
		}
	});

	function onKeyDown(e: KeyboardEvent) {
		if (e.code === 'Escape') {
			props.onclose?.(e);
		}
	}

	const popupId = createId('popup');
</script>

<div
	bind:this={element}
	class={['popup', className]}
	onkeydown={onKeyDown}
	role="dialog"
	tabindex={-1}
	id={popupId}
	style="z-index:{zIndex};"
	use:clickOutside={(e) => props.onclose?.(e)}
	use:usePopperToolip={{
		placement: placement,
		modifiers: [
			{
				name: 'offset',
				options: {
					offset: [0, 10]
				}
			}
		]
	}}
>
	{#if children}
		{@render children?.()}
	{/if}
</div>

<style>
	.popup {
		width: max-content;
		height: max-content;
		padding: 0;
		z-index: 2;
	}
</style>
