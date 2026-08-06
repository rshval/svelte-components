<script lang="ts">
	import Button from '../components/Button.svelte';
	import Table from '../components/table/Table.svelte';
	import TableFilters from '../components/table/TableFilters.svelte';
	import TablePagination from '../components/table/TablePagination.svelte';
	import TableActionsCell from './TableActionsCell.svelte';
	import TableActiveCell from './TableActiveCell.svelte';

	const rows: Components.Table.Row[] = [
		{ id: '1', name: 'Anna Keller', role: 'Manager', status: 'Active', score: 82, active: true },
		{ id: '2', name: 'Ilya Morozov', role: 'Operator', status: 'Paused', score: 71, active: false },
		{ id: '3', name: 'Mira Stone', role: 'Admin', status: 'Active', score: 95, active: true },
		{ id: '4', name: 'Noah Reed', role: 'Support', status: 'Pending', score: 64, active: false },
		{ id: '5', name: 'Sofia Ray', role: 'Analyst', status: 'Active', score: 89, active: true },
		{ id: '6', name: 'Leo Grant', role: 'Operator', status: 'Blocked', score: 41, active: false },
		{ id: '7', name: 'Eva Brooks', role: 'Manager', status: 'Pending', score: 77, active: true },
		{ id: '8', name: 'Max Payne', role: 'Support', status: 'Active', score: 68, active: true },
		{ id: '9', name: 'Nina Vale', role: 'Admin', status: 'Paused', score: 73, active: false },
		{ id: '10', name: 'Oleg North', role: 'Analyst', status: 'Active', score: 91, active: true },
		{ id: '11', name: 'Lena Hart', role: 'Operator', status: 'Pending', score: 58, active: false },
		{ id: '12', name: 'Ivan Cruz', role: 'Support', status: 'Blocked', score: 36, active: false },
		{ id: '13', name: 'Tara Miles', role: 'Manager', status: 'Active', score: 86, active: true },
		{ id: '14', name: 'Victor Lane', role: 'Analyst', status: 'Paused', score: 69, active: false }
	];

	const columns: Components.Table.Column[] = [
		{ id: 'name', title: 'Name', sortable: true },
		{ id: 'role', title: 'Role', sortable: true },
		{
			id: 'status',
			title: 'Status',
			sortable: true,
			tpl: (row) => {
				const status = String(row.status ?? '');
				const style =
					status === 'Active'
						? 'badge-success'
						: status === 'Pending'
							? 'badge-warning'
							: status === 'Blocked'
								? 'badge-error'
								: 'badge-neutral';

				return `<span class="badge badge-sm ${style}">${status}</span>`;
			}
		},
		{ id: 'score', title: 'Score', sortable: true, sortType: 'number', align: 'right' },
		{
			id: 'active',
			title: 'Enabled',
			component: TableActiveCell,
			props: {},
			propsFn: (row) => ({ row })
		},
		{
			id: 'actions',
			title: '',
			align: 'right',
			component: TableActionsCell,
			props: {
				onEdit: (row: Components.Table.Row) => {
					selected = row;
				}
			},
			propsFn: (row) => ({ row })
		}
	];

	let query = $state('');
	let status = $state('all');
	let page = $state(1);
	let limit = $state(5);
	let selected = $state<Components.Table.Row | undefined>();
	let sortBy = $state<string | undefined>('score');
	let sortDirection = $state<Components.Table.SortDirection | undefined>('desc');

	const filteredRows = $derived(
		rows.filter((row) => {
			const matchesStatus = status === 'all' || row.status === status;
			const matchesQuery = Object.values(row).join(' ').toLowerCase().includes(query.toLowerCase());

			return matchesStatus && matchesQuery;
		})
	);
	const sortedRows = $derived(sortRows(filteredRows));
	const pagedRows = $derived(sortedRows.slice((page - 1) * limit, page * limit));

	function sortRows(items: Components.Table.Row[]) {
		const key = sortBy;
		const column = columns.find((item) => item.id === key);

		if (!key || !sortDirection || !column) {
			return items;
		}

		return [...items]
			.map((row, index) => ({ row, index }))
			.sort((a, b) => {
				const first = a.row[key];
				const second = b.row[key];
				const result =
					column.sortType === 'number'
						? Number(first ?? 0) - Number(second ?? 0)
						: String(first ?? '').localeCompare(String(second ?? ''), undefined, {
								numeric: true,
								sensitivity: 'base'
							});

				return (sortDirection === 'asc' ? result : -result) || a.index - b.index;
			})
			.map((item) => item.row);
	}

	function resetFilters() {
		query = '';
		status = 'all';
		page = 1;
	}

	function updateSort(sort: {
		id: string | undefined;
		direction: Components.Table.SortDirection | undefined;
	}) {
		sortBy = sort.id;
		sortDirection = sort.direction;
		page = 1;
	}
</script>

<div class="max-w-5xl px-1">
	<TableFilters
		title="Team"
		count={filteredRows.length}
		bodyClass="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_auto]"
	>
		{#snippet actions()}
			<Button class="btn-ghost btn-sm" onclick={resetFilters}>Reset</Button>
		{/snippet}

		<input
			class="input input-bordered input-sm"
			type="search"
			aria-label="Search team"
			placeholder="Search"
			bind:value={query}
			oninput={() => (page = 1)}
		/>
		<select
			class="select select-bordered select-sm"
			aria-label="Status"
			bind:value={status}
			onchange={() => (page = 1)}
		>
			<option value="all">All statuses</option>
			<option value="Active">Active</option>
			<option value="Pending">Pending</option>
			<option value="Paused">Paused</option>
			<option value="Blocked">Blocked</option>
		</select>
		<Button class="btn-primary btn-sm">Apply</Button>
	</TableFilters>

	<Table
		{columns}
		rows={pagedRows}
		bind:selected
		hover
		zebra
		manualSort
		{sortBy}
		{sortDirection}
		onSortChange={updateSort}
		class="table-sm"
	/>

	<TablePagination
		total={filteredRows.length}
		{page}
		{limit}
		limitOptions={[5, 10, 25]}
		onPageChange={(value) => (page = value)}
		onLimitChange={(value) => {
			limit = value;
			page = 1;
		}}
	/>

	{#if selected}
		<p class="mt-2 text-xs text-base-content/60">Selected: {selected.name}</p>
	{/if}
</div>
