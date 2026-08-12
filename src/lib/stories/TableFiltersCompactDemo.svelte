<script lang="ts">
	import Button from '../components/Button.svelte';
	import TableFilters from '../components/table/TableFilters.svelte';
</script>

<TableFilters
	showHeader={false}
	bodyClass="grid grid-cols-1 gap-3 md:grid-cols-[1fr_160px_auto_auto]"
>
	<input
		class="input-bordered input input-sm"
		type="search"
		aria-label="Search"
		placeholder="Search"
	/>
	<select class="select-bordered select select-sm" aria-label="Status">
		<option>All statuses</option>
		<option>Active</option>
		<option>Pending</option>
		<option>Blocked</option>
	</select>
	<Button class="btn-primary btn-sm">Apply</Button>
	<Button class="btn-ghost btn-sm">Reset</Button>
</TableFilters>
