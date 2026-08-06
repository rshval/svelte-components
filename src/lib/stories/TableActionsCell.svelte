<script lang="ts">
	import Button from '../components/Button.svelte';

	let {
		row,
		onEdit
	}: {
		row: Components.Table.Row;
		onEdit?: (row: Components.Table.Row) => void;
	} = $props();
</script>

<div class="flex justify-end gap-1">
	<Button class="btn-ghost btn-xs" onclick={() => onEdit?.(row)}>Edit</Button>
	<Button class="btn-outline btn-xs">Open</Button>
</div>
