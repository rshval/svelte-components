<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { isOpenedDrawer } from './drawer.store.js';
	import type { Snippet } from 'svelte';
	let {
		children,
		button
	}: {
		children?: Snippet;
		button?: Snippet;
	} = $props();

	beforeNavigate(({ from, to }) => {
		$isOpenedDrawer = false;
	});
</script>

<div class="drawer z-20">
	<input id="my-drawer" type="checkbox" class="drawer-toggle" bind:checked={$isOpenedDrawer} />
	<div class="drawer-content">
		<!-- Page content here -->
		{#if button}
			{@render button?.()}
		{:else}
			<label for="my-drawer" class="drawer-button btn btn-primary">Навигация</label>
		{/if}
	</div>
	<div class="drawer-side">
		<label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>

		<div class="drawer__wrap min-h-full w-80 bg-base-200 p-4 text-base-content">
			{@render children?.()}
		</div>
	</div>
</div>

<style>
	.drawer__wrap {
		padding-top: calc(var(--theme-safe-area-top) + 1rem);
		padding-bottom: calc(var(--theme-safe-area-bottom) + 1rem);
	}
</style>
