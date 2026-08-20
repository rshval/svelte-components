<script lang="ts">
	import TableStack from './TableStack.svelte';

	const rows: Components.Table.Row[] = [
		{ id: '1', title: 'Apple juice', status: 'Active' },
		{ id: '2', title: 'Orange marmalade', status: 'Paused' }
	];
</script>

<TableStack {rows} ariaLabel="Products">
	{#snippet row(item, index)}
		<article>
			<h2>{index + 1}. {item.title}</h2>
			<p>{item.status}</p>
		</article>
	{/snippet}
</TableStack>
