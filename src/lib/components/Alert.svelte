<script lang="ts">
	import { animationDuration } from '$lib/constants.js';
	import { fly } from 'svelte/transition';
	import { type Snippet } from 'svelte';
	const {
		children,
		y = -50,
		x = 0,
		class: className
	}: {
		children?: Snippet;
		y?: number;
		x?: number;
		class?: string;
	} = $props();
</script>

<div
	role="alert"
	class={['alert', className]}
	in:fly|local={{ y: y, x: x, duration: animationDuration }}
>
	{@render children?.()}
</div>
