<script lang="ts">
	import Button from '../components/Button.svelte';
	import TableFilters from '../components/table/TableFilters.svelte';

	let { framed = false }: { framed?: boolean } = $props();
</script>

<TableFilters
	title="Filters"
	count={24}
	{framed}
	bodyClass="grid grid-cols-1 gap-3 md:grid-cols-[1fr_160px_160px_auto]"
>
	{#snippet actions()}
		<Button class="btn-ghost btn-sm">Reset</Button>
	{/snippet}

	<input
		class="input input-bordered input-sm"
		type="search"
		aria-label="Search"
		placeholder="Search customers"
	/>
	<select class="select select-bordered select-sm" aria-label="Status">
		<option>All statuses</option>
		<option>Active</option>
		<option>Pending</option>
		<option>Blocked</option>
	</select>
	<select class="select select-bordered select-sm" aria-label="Role">
		<option>All roles</option>
		<option>Admin</option>
		<option>Manager</option>
		<option>Operator</option>
	</select>
	<Button class="btn-primary btn-sm">Apply</Button>
</TableFilters>
