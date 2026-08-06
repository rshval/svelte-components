<script lang="ts">
	import TablePagination from '../components/table/TablePagination.svelte';

	let page = $state(2);
	let limit = $state(10);
</script>

<div class="w-full">
	<TablePagination
		total={96}
		{page}
		{limit}
		limitOptions={[10, 25, 50]}
		onPageChange={(value) => (page = value)}
		onLimitChange={(value) => {
			limit = value;
			page = 1;
		}}
	/>
</div>
