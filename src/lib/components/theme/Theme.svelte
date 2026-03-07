<script lang="ts">
	import './style.css';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import { BROWSER } from 'esm-env';
	import { initDeviceInfo } from '$lib/stores/plugins/device-info.store.js';
	import darkModeStore from './dark-mode.store.js';

	let {
		children,
		colorLight = '#ebebeb',
		colorDark = '#20252e',
		themes = ['light', 'dark']
	}: {
		children?: Snippet;
		colorLight?: string;
		colorDark?: string;
		themes?: string[];
	} = $props();

	$effect(() => {
		if (BROWSER) {
			darkModeStore.initDarkMode(themes);
		}
	});

	onMount(async () => {
		initDeviceInfo();
	});

	let themeColor = $derived(!$darkModeStore ? colorLight : colorDark);
</script>

<svelte:head>
	<meta name="theme-color" content={themeColor} />
</svelte:head>

<div class="theme">
	{@render children?.()}
</div>

<style>
	.theme {
		display: contents;
	}
</style>
