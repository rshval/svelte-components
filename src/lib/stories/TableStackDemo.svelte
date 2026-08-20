<script lang="ts">
	import Badge from '../components/Badge.svelte';
	import Button from '../components/Button.svelte';
	import TablePagination from '../components/table/TablePagination.svelte';
	import TableStack from '../components/table/TableStack.svelte';

	const rows: Components.Table.Row[] = [
		{
			id: '1',
			title: 'Apple juice',
			meta: 'Bottle 0.75 l',
			status: 'Available',
			stock: 42,
			price: '$4.50'
		},
		{
			id: '2',
			title: 'Orange marmalade',
			meta: 'Jar 250 g',
			status: 'Low stock',
			stock: 3,
			price: '$6.20'
		},
		{
			id: '3',
			title: 'Buckwheat granola',
			meta: 'Pack 400 g',
			status: 'Paused',
			stock: 0,
			price: '$8.10'
		}
	];

	let query = $state('');
	let status = $state('all');
	let page = $state(1);
	let limit = $state(2);

	const filteredRows = $derived(
		rows.filter((row) => {
			const matchesStatus = status === 'all' || row.status === status;
			const matchesQuery = Object.values(row)
				.join(' ')
				.toLowerCase()
				.includes(query.trim().toLowerCase());

			return matchesStatus && matchesQuery;
		})
	);
	const pagedRows = $derived(filteredRows.slice((page - 1) * limit, page * limit));

	function resetFilters() {
		query = '';
		status = 'all';
		page = 1;
	}
</script>

<div class="grid max-w-xl gap-3 px-1">
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px_auto]">
		<input
			class="input-bordered input input-sm"
			type="search"
			aria-label="Search products"
			placeholder="Search products"
			bind:value={query}
			oninput={() => (page = 1)}
		/>
		<select
			class="select-bordered select select-sm"
			aria-label="Status"
			bind:value={status}
			onchange={() => (page = 1)}
		>
			<option value="all">All statuses</option>
			<option value="Available">Available</option>
			<option value="Low stock">Low stock</option>
			<option value="Paused">Paused</option>
		</select>
		<Button class="btn-ghost btn-sm" onclick={resetFilters}>Reset</Button>
	</div>

	<TableStack rows={pagedRows} ariaLabel="Products" emptyLabel="No products found.">
		{#snippet row(item)}
			<div class="grid gap-3">
				<div class="flex items-start justify-between gap-3">
					<div class="min-w-0">
						<div class="font-semibold">{item.title}</div>
						<div class="text-xs text-base-content/60">{item.meta}</div>
					</div>
					<Badge
						class={item.status === 'Available'
							? 'badge-sm badge-success'
							: item.status === 'Low stock'
								? 'badge-sm badge-warning'
								: 'badge-sm badge-neutral'}
					>
						{item.status}
					</Badge>
				</div>
				<div class="grid grid-cols-2 gap-2 text-sm">
					<div class="rounded-box bg-base-200 p-2">
						<div class="text-xs text-base-content/60">Stock</div>
						<div class="font-medium">{item.stock}</div>
					</div>
					<div class="rounded-box bg-base-200 p-2">
						<div class="text-xs text-base-content/60">Price</div>
						<div class="font-medium">{item.price}</div>
					</div>
				</div>
				<div class="flex flex-wrap justify-end gap-2">
					<Button class="btn-outline btn-xs">Open</Button>
					<Button class="btn-primary btn-xs">Edit</Button>
				</div>
			</div>
		{/snippet}
	</TableStack>

	<TablePagination
		total={filteredRows.length}
		{page}
		{limit}
		limitOptions={[2, 5, 10]}
		onPageChange={(value) => (page = value)}
		onLimitChange={(value) => {
			limit = value;
			page = 1;
		}}
	/>
</div>
