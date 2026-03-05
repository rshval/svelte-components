<script lang="ts">
	let {
		onclose,
		items = [],
		class: className
	}: {
		class?: string;
		items?: { type: 'info' | 'alert' | 'success'; message: string; class?: string }[];
		onclose?: (item: {
			type: 'info' | 'alert' | 'success';
			message: string;
			class?: string;
		}) => void;
	} = $props();
</script>

<div class={['toast', 'toast-end', className]}>
	{#if items?.length}
		{#each items as item, index (`${item.type}_${item.message}_${index}`)}
			<button
				type="button"
				class={['alert', item.type === 'alert' ? 'alert-error' : `alert-${item.type}`, item.class]}
				onclick={() => onclose?.(item)}
			>
				<span>{item.message}</span>
			</button>
		{/each}
	{/if}
</div>
