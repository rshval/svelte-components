<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		rows = [],
		loading = false,
		emptyLabel = 'Nothing found.',
		loadingLabel = 'Loading...',
		ariaLabel = 'Items',
		class: className,
		listClass,
		itemClass,
		row
	}: {
		rows?: Components.Table.Row[];
		loading?: boolean;
		emptyLabel?: string;
		loadingLabel?: string;
		ariaLabel?: string;
		class?: string;
		listClass?: string;
		itemClass?: string;
		row?: Snippet<[Components.Table.Row, number]>;
	} = $props();

	function getRowKey(item: Components.Table.Row, index: number) {
		return item._id ?? item.id ?? `row_${index}`;
	}

	function getDefaultTitle(item: Components.Table.Row) {
		return String(item.title ?? item.name ?? item.id ?? item._id ?? '');
	}
</script>

<section
	class={['table-stack grid gap-2', className]}
	aria-label={ariaLabel}
	aria-busy={loading ? 'true' : undefined}
>
	{#if loading}
		<div
			role="status"
			class="rounded-box border border-base-300 bg-base-100 p-4 text-center text-sm text-base-content/70"
		>
			<span class="inline-flex items-center justify-center gap-2">
				<span class="loading loading-sm loading-spinner text-primary" aria-hidden="true"></span>
				<span>{loadingLabel}</span>
			</span>
		</div>
	{:else if !rows.length}
		<div
			role="status"
			class="rounded-box border border-base-300 bg-base-100 p-4 text-center text-sm text-base-content/60"
		>
			{emptyLabel}
		</div>
	{:else}
		<ul class={['grid list-none gap-2 p-0', listClass]} role="list">
			{#each rows as rowItem, rowIndex (getRowKey(rowItem, rowIndex))}
				<li class={['rounded-box border border-base-300 bg-base-100 p-3 shadow-sm', itemClass]}>
					{#if row}
						{@render row(rowItem, rowIndex)}
					{:else}
						<div class="text-sm font-medium text-base-content">{getDefaultTitle(rowItem)}</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</section>
