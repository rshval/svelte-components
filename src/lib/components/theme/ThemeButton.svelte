<script lang="ts">
	import darkModeStore from './dark-mode.store.js';

	import IconSun from '@tabler/icons-svelte-runes/icons/sun';
	import IconMoon from '@tabler/icons-svelte-runes/icons/moon';
	import IconSunMoon from '@tabler/icons-svelte-runes/icons/sun-moon';
	import { fade } from 'svelte/transition';
	import { animationDuration } from '$lib/constants.js';

	let {
		size = 24,
		class: className
	}: {
		size?: number;
		class?: any;
	} = $props();
	function onClick() {
		darkModeStore.setDarkMode(!$darkModeStore);
	}
</script>

<button class={['theme-button swap swap-rotate', className]} onclick={onClick}>
	{#if typeof $darkModeStore === 'boolean'}
		<div
			in:fade={{ duration: animationDuration }}
			class:swap-on={!$darkModeStore}
			class:swap-off={$darkModeStore}
			style="width:{size}px;"
		>
			<IconMoon {size} />
		</div>
		<div
			in:fade={{ duration: animationDuration }}
			class:swap-on={$darkModeStore}
			class:swap-off={!$darkModeStore}
			style="width:{size}px;"
		>
			<IconSun {size} />
		</div>
	{:else}
		<div style="width:{size}px;" out:fade={{ duration: animationDuration }}>
			<IconSunMoon {size} />
		</div>
	{/if}
</button>

<style>
	/* .theme-button > div {
		width: 24px;
		height: 24px;
	} */
</style>
