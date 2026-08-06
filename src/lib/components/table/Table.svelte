<script lang="ts">
	import IconChevronUp from '@tabler/icons-svelte-runes/icons/chevron-up';
	import { type Snippet } from 'svelte';

	let {
		rows = $bindable([]),
		columns = $bindable([]),
		zebra = false,
		hover = false,
		selected = $bindable(),
		class: className,
		emptyLabel = 'Nothing found.',
		sortBy,
		sortDirection,
		manualSort = false,
		onSortChange,
		ths,
		trs
	}: {
		selected?: Components.Table.Row | undefined;
		rows?: Components.Table.Row[];
		columns: Components.Table.Column[];
		zebra?: boolean;
		hover?: boolean;
		ths?: Snippet;
		trs?: Snippet;
		class?: string;
		emptyLabel?: string;
		sortBy?: string;
		sortDirection?: Components.Table.SortDirection;
		manualSort?: boolean;
		onSortChange?: (sort: {
			id: string | undefined;
			direction: Components.Table.SortDirection | undefined;
			column: Components.Table.Column;
		}) => void;
	} = $props();

	let internalSortBy = $state<string | undefined>();
	let internalSortDirection = $state<Components.Table.SortDirection | undefined>();

	const activeSortBy = $derived(sortBy ?? internalSortBy);
	const activeSortDirection = $derived(sortDirection ?? internalSortDirection);
	const visibleRows = $derived(getVisibleRows());

	function getVisibleRows() {
		if (manualSort || !activeSortBy || !activeSortDirection) {
			return rows;
		}

		const column = columns.find((item) => item.id === activeSortBy);

		if (!column) {
			return rows;
		}

		return [...rows]
			.map((row, index) => ({ row, index }))
			.sort((a, b) => {
				const result = compareValues(a.row[activeSortBy], b.row[activeSortBy], column.sortType);
				const orderedResult = activeSortDirection === 'asc' ? result : -result;

				return orderedResult || a.index - b.index;
			})
			.map((item) => item.row);
	}

	function compareValues(
		a: unknown,
		b: unknown,
		type: Components.Table.SortType = 'string'
	): number {
		if (type === 'number') {
			return Number(a ?? 0) - Number(b ?? 0);
		}

		if (type === 'date') {
			const firstDate = new Date(String(a ?? '')).getTime();
			const secondDate = new Date(String(b ?? '')).getTime();

			return (
				(Number.isNaN(firstDate) ? 0 : firstDate) - (Number.isNaN(secondDate) ? 0 : secondDate)
			);
		}

		return String(a ?? '').localeCompare(String(b ?? ''), undefined, {
			numeric: true,
			sensitivity: 'base'
		});
	}

	function getNextSortDirection(columnId: string): Components.Table.SortDirection | undefined {
		if (activeSortBy !== columnId) {
			return 'asc';
		}

		if (activeSortDirection === 'asc') {
			return 'desc';
		}

		if (activeSortDirection === 'desc') {
			return undefined;
		}

		return 'asc';
	}

	function updateSort(column: Components.Table.Column) {
		if (!column.id || column.sortable !== true) {
			return;
		}

		const direction = getNextSortDirection(column.id);
		const id = direction ? column.id : undefined;

		internalSortBy = id;
		internalSortDirection = direction;
		onSortChange?.({ id, direction, column });
	}

	function onHeaderKeydown(event: KeyboardEvent, column: Components.Table.Column) {
		if (event.key !== 'Enter' && event.key !== ' ') {
			return;
		}

		event.preventDefault();
		updateSort(column);
	}

	function getAriaSort(column: Components.Table.Column) {
		if (!column.id || column.id !== activeSortBy || !activeSortDirection) {
			return 'none';
		}

		return activeSortDirection === 'asc' ? 'ascending' : 'descending';
	}
</script>

<div
	class="table-shell mt-3 mb-2 max-w-full flex-1 gap-2 overflow-hidden rounded-xl border border-base-300 bg-base-100"
>
	<div class="table-scroll max-w-full overflow-x-auto">
		<table
			class={[
				'table',
				'table-pin-rows',
				'w-full',
				'min-w-160',
				zebra ? 'table-zebra' : '',
				className
			]}
		>
			<thead>
				<tr class={[hover ? 'hover:bg-base-200' : '']}>
					{#if columns && !ths}
						{#each columns as column, columnIndex (column.id ?? `${column.title ?? 'column'}_${columnIndex}`)}
							<th
								scope="col"
								aria-sort={getAriaSort(column)}
								class={[
									'sticky top-0 z-10 border-b border-base-300 bg-base-100/95 text-xs font-semibold text-base-content/70 backdrop-blur first:rounded-tl-xl last:rounded-tr-xl',
									column.flex ? 'w-1/2' : '',
									column.align === 'right' ? 'text-right' : '',
									column.id && column.id === activeSortBy ? 'bg-primary/10 text-base-content' : '',
									column.className ? ' ' + column.className : ''
								]}
							>
								{#if column.id && column.sortable === true}
									<button
										type="button"
										class={[
											'inline-flex w-full cursor-pointer items-center gap-1.5 rounded-md py-1 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
											column.align === 'right' ? 'justify-end text-right' : 'justify-start'
										]}
										onclick={() => updateSort(column)}
										onkeydown={(event) => onHeaderKeydown(event, column)}
									>
										<span>{column.title ? column.title : ''}</span>
										<span
											class={[
												'inline-flex text-base-content/35 transition-transform',
												column.id === activeSortBy ? 'text-primary' : '',
												column.id === activeSortBy && activeSortDirection === 'desc'
													? 'rotate-180'
													: ''
											]}
											aria-hidden="true"
										>
											<IconChevronUp size={14} stroke={2} />
										</span>
									</button>
								{:else}
									<span>{column.title ? column.title : ''}</span>
								{/if}
							</th>
						{/each}
					{:else if ths}
						{@render ths()}
					{/if}
				</tr>
			</thead>
			<tbody>
				{#if rows && !trs}
					{#each visibleRows as row, rowIndex (row._id ?? row.id ?? `row_${rowIndex}`)}
						<tr
							class={['group border-b border-base-200/70 last:border-b-0']}
							class:bg-base-300={selected
								? selected?._id
									? selected?._id === row._id
									: selected?.id === row.id
								: false}
							onclick={() => (selected = row)}
						>
							{#each columns as column, columnIndex (column.id ?? `${column.title ?? 'column'}_${columnIndex}`)}
								<svelte:element
									this={column.id === 'id' ? 'th' : 'td'}
									class={[
										column.align === 'right' ? 'text-right tabular-nums' : '',
										column.id && column.id === activeSortBy
											? 'bg-primary/10 group-hover:bg-primary/12'
											: '',
										hover && column.id !== activeSortBy ? 'group-hover:bg-primary/5' : ''
									]}
								>
									{#if column.tpl}
										<!-- eslint-disable-next-line svelte/no-at-html-tags -->
										{@html column.tpl(row, column)}
									{:else if column.component}
										{@const ColumnComponent = column.component}
										{#if column.propsFn}
											<ColumnComponent {...column.props ?? {}} {...column.propsFn(row)} />
										{:else}
											<ColumnComponent {...column.props ?? {}} />
										{/if}
									{:else if column.id}
										<!-- eslint-disable-next-line svelte/no-at-html-tags -->
										{@html String(row[column.id])}
									{/if}
								</svelte:element>
							{/each}
						</tr>
					{/each}
					{#if !rows.length}
						<tr>
							<td colspan={columns.length || 1} class="py-8 text-center text-base-content/60"
								>{emptyLabel}</td
							>
						</tr>
					{/if}
				{:else if trs}
					{@render trs()}
				{/if}
			</tbody>
			<tfoot>
				<tr class={[hover ? 'hover:bg-base-200' : '']}>
					{#if columns.length}
						{#each columns as column, columnIndex (column.id ?? `${column.title ?? 'column'}_${columnIndex}`)}
							<th
								class={[
									'border-t border-base-300 bg-base-100 text-xs font-semibold text-base-content/70 first:rounded-bl-xl last:rounded-br-xl',
									column.align === 'right' ? 'text-right' : ''
								]}
							>
								{column.title ? column.title : ''}
							</th>
						{/each}
					{:else}
						<th></th>
					{/if}
				</tr>
			</tfoot>
		</table>
	</div>
</div>
