<script lang="ts">
	import { type Snippet } from 'svelte';
	let {
		rows = $bindable([]),
		columns = $bindable([]),
		zebra = false,
		hover = false,
		selected = $bindable(),
		class: className,
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
	} = $props();
</script>

<div
	class="mt-3 mb-2 max-w-full flex-1 gap-2 overflow-x-auto rounded-2xl border border-gray-400/20 bg-base-100 p-3"
>
	<table class={['table', 'table-pin-rows', 'w-full', zebra ? 'table-zebra' : '', className]}>
		<thead>
			<tr class={[hover ? 'hover:bg-base-200' : '']}>
				{#if columns && !ths}
					{#each columns as column, columnIndex (column.id ?? `${column.title ?? 'column'}_${columnIndex}`)}
						<th class={[column.flex ? 'w-1/2' : '', column.className ? ' ' + column.className : '']}
							>{column.title ? column.title : ''}</th
						>
					{/each}
				{:else if ths}
					{@render ths()}
				{/if}
			</tr>
		</thead>
		<tbody>
			{#if rows && !trs}
				{#each rows as row, rowIndex (row._id ?? row.id ?? `row_${rowIndex}`)}
					<tr
						class={[hover ? 'hover:bg-base-200' : '']}
						class:bg-base-300={selected
							? selected?._id
								? selected?._id === row._id
								: selected?.id === row.id
							: false}
						onclick={() => (selected = row)}
					>
						{#each columns as column, columnIndex (column.id ?? `${column.title ?? 'column'}_${columnIndex}`)}
							<svelte:element this={row.id === 'id' ? 'th' : 'td'}>
								{#if column.tpl}
									<!-- eslint-disable-next-line svelte/no-at-html-tags -->
									{@html column.tpl(row, column)}
								{:else if column.component && column.props}
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
			{:else if trs}
				{@render trs()}
			{/if}
			<!--
			<tr class="hover bg-base-300">
				<th>2</th>
				<td>Hart Hagerty</td>
				<td>Desktop Support Technician</td>
				<td>Zemlak, Daniel and Leannon</td>
				<td>United States</td>
				<td>12/5/2020</td>
				<td>Purple</td>
			</tr> -->
		</tbody>
		<tfoot>
			<tr class={[hover ? 'hover:bg-base-200' : '']}>
				{#if columns.length}
					{#each columns as column, columnIndex (column.id ?? `${column.title ?? 'column'}_${columnIndex}`)}
						<th>{column.title ? column.title : ''}</th>
					{/each}
				{:else}
					<th></th>
				{/if}
			</tr>
		</tfoot>
	</table>
</div>
