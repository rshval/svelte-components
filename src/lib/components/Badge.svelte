<script lang="ts">
	import { type Snippet } from 'svelte';
	let { children, class: className }: { children?: Snippet; class?: string } = $props();
</script>

<span class={['badge', className]}>
	{#if children}
		{@render children()}
	{/if}
</span>
