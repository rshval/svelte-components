<script lang="ts">
	let {
		themeBg,
		absolute,
		shadow,
		class: className = 'loading-lg'
	}: { themeBg?: boolean; absolute?: boolean; shadow?: boolean; class?: string } = $props();
</script>

{#if shadow}
	<div class="loader-shadow absolute top-0 left-0 bg-gray-100 opacity-50"></div>
{/if}
<div
	class={[
		'loader align-center flex flex-1 justify-center',
		absolute ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform' : ''
	]}
>
	<span class={['loading', 'loading-spinner', themeBg ? 'theme-bg-1' : 'text-primary', className]}
	></span>
</div>

<style>
	.loader-shadow,
	.loader {
		height: 100%;
		width: 100%;
	}
	.loader-shadow {
		z-index: 10;
	}
	.loader {
		z-index: 11;
	}
</style>
