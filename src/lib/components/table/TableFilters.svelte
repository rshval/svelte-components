<script lang="ts">
	import type { TableFiltersProps } from './TableFilters.types.js';

	let {
		title = 'Фильтры',
		count,
		class: className = '',
		bodyClass = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5',
		actions,
		children
	}: TableFiltersProps = $props();
</script>

<div class={['mb-6 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm', className]}>
	<div class="mb-4 flex items-center justify-between gap-3">
		<h3 class="flex items-center gap-2 text-lg font-semibold">
			<span>{title}</span>
			{#if count !== undefined}
				<span class="badge badge-sm badge-neutral">{count}</span>
			{/if}
		</h3>
		{#if actions}
			{@render actions()}
		{:else}
			<slot name="actions" />
		{/if}
	</div>

	<div class={bodyClass}>
		{#if children}
			{@render children()}
		{:else}
			<slot />
		{/if}
	</div>
</div>
