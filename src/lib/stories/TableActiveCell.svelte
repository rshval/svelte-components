<script lang="ts">
	import Switch from '../components/Switch.svelte';

	let { row }: { row: Components.Table.Row } = $props();
</script>

<Switch
	checked={Boolean(row.active)}
	styleType={row.active ? 'success' : 'neutral'}
	aria-label="Active"
/>
