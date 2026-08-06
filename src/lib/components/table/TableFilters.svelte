<script lang="ts">
	import type { TableFiltersProps } from './TableFilters.types.js';

	let {
		title = 'Filters',
		count,
		class: className = '',
		bodyClass = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5',
		framed = false,
		showHeader = true,
		actions,
		children
	}: TableFiltersProps = $props();
</script>

<div
	class={[
		'table-filters mb-4',
		framed ? 'rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-5' : '',
		className
	]}
>
	{#if showHeader}
		<div class="mb-4 flex items-center justify-between gap-3">
			<h3 class="flex items-center gap-2 text-base font-semibold">
				<span>{title}</span>
				{#if count !== undefined}
					<span class="badge badge-sm badge-neutral">{count}</span>
				{/if}
			</h3>
			{#if actions}
				{@render actions()}
			{/if}
		</div>
	{:else if actions}
		<div class="mb-4 flex justify-end">
			{@render actions()}
		</div>
	{/if}

	<div class={bodyClass}>
		{@render children?.()}
	</div>
</div>
