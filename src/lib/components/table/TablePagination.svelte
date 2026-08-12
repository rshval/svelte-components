<script lang="ts">
	import IconChevronLeft from '@tabler/icons-svelte-runes/icons/chevron-left';
	import IconChevronRight from '@tabler/icons-svelte-runes/icons/chevron-right';

	type PageItem = number | 'ellipsis';

	let {
		total = 0,
		page = 1,
		limit = 20,
		limitOptions = [10, 20, 50],
		class: className = '',
		summary,
		pageLabel,
		rangeSeparator = 'of',
		rowsPerPageLabel = 'Rows per page',
		previousLabel = 'Previous page',
		nextLabel = 'Next page',
		paginationLabel = 'Table pagination',
		showLimit = true,
		showPages,
		onLimitChange,
		onPageChange,
		onPrev,
		onNext,
		canPrev,
		canNext
	}: {
		total?: number;
		page?: number;
		limit?: number;
		limitOptions?: number[];
		class?: string;
		summary?: string;
		pageLabel?: string;
		rangeSeparator?: string;
		rowsPerPageLabel?: string;
		previousLabel?: string;
		nextLabel?: string;
		paginationLabel?: string;
		showLimit?: boolean;
		showPages?: boolean;
		onLimitChange?: (value: number) => void;
		onPageChange?: (value: number) => void;
		onPrev?: () => void;
		onNext?: () => void;
		canPrev?: boolean;
		canNext?: boolean;
	} = $props();

	const totalPages = $derived(Math.max(1, Math.ceil(total / Math.max(1, limit))));
	const currentPage = $derived(Math.min(Math.max(1, page), totalPages));
	const resolvedCanPrev = $derived(canPrev ?? currentPage > 1);
	const resolvedCanNext = $derived(canNext ?? currentPage < totalPages);
	const resolvedShowPages = $derived(showPages ?? !pageLabel);
	const pageItems = $derived(getPageItems(currentPage, totalPages));
	const rangeSummary = $derived(getRangeSummary());

	function getRangeSummary() {
		if (!total) {
			return `0-0 ${rangeSeparator} 0`;
		}

		const from = (currentPage - 1) * limit + 1;
		const to = Math.min(currentPage * limit, total);

		return `${from}-${to} ${rangeSeparator} ${total}`;
	}

	function getPageItems(current: number, pagesTotal: number): PageItem[] {
		const items = new Set<number>([1, pagesTotal, current, current - 1, current + 1]);
		const pages = [...items]
			.filter((item) => item >= 1 && item <= pagesTotal)
			.sort((a, b) => a - b);
		const result: PageItem[] = [];

		for (const item of pages) {
			const previous = result[result.length - 1];

			if (typeof previous === 'number' && item - previous > 1) {
				result.push('ellipsis');
			}

			result.push(item);
		}

		return result;
	}

	function changePage(value: number) {
		const nextPage = Math.min(Math.max(1, value), totalPages);

		if (nextPage === currentPage) {
			return;
		}

		onPageChange?.(nextPage);
	}

	function goPrev() {
		if (!resolvedCanPrev) {
			return;
		}

		if (onPrev) {
			onPrev();
			return;
		}

		changePage(currentPage - 1);
	}

	function goNext() {
		if (!resolvedCanNext) {
			return;
		}

		if (onNext) {
			onNext();
			return;
		}

		changePage(currentPage + 1);
	}
</script>

<div
	class={[
		'table-pagination flex w-full flex-col gap-3 px-1 py-3 sm:flex-row sm:items-center sm:justify-between',
		className
	]}
>
	<div class="flex min-w-max items-center gap-2">
		{#if showLimit}
			<select
				class="select-bordered select w-auto min-w-18 shrink-0 pr-8 select-sm"
				aria-label={rowsPerPageLabel}
				value={limit}
				onchange={(event) =>
					onLimitChange?.(Number((event.target as HTMLSelectElement).value || limit))}
			>
				{#each limitOptions as option}
					<option value={option}>{option}</option>
				{/each}
			</select>
		{/if}
		<p class="text-sm whitespace-nowrap text-base-content/70" aria-live="polite" aria-atomic="true">
			{summary || rangeSummary}
		</p>
	</div>

	<nav class="flex w-full items-center justify-end gap-1 sm:w-auto" aria-label={paginationLabel}>
		<button
			type="button"
			class="btn btn-square btn-outline btn-sm"
			disabled={!resolvedCanPrev}
			title={previousLabel}
			aria-label={previousLabel}
			onclick={goPrev}
		>
			<IconChevronLeft size={16} stroke={2} aria-hidden="true" />
		</button>

		{#if resolvedShowPages}
			<div class="flex items-center gap-0.5">
				{#each pageItems as item, itemIndex (`${item}_${itemIndex}`)}
					{#if item === 'ellipsis'}
						<span class="px-1 text-sm text-base-content/40" aria-hidden="true">...</span>
					{:else}
						<button
							type="button"
							class={[
								'btn min-w-9 px-2 btn-sm',
								item === currentPage ? 'shadow-sm btn-primary' : 'btn-ghost'
							]}
							aria-current={item === currentPage ? 'page' : undefined}
							onclick={() => changePage(item)}
						>
							{item}
						</button>
					{/if}
				{/each}
			</div>
		{:else if pageLabel}
			<span class="text-sm whitespace-nowrap text-base-content/70">{pageLabel}</span>
		{/if}

		<button
			type="button"
			class="btn btn-square btn-outline btn-sm"
			disabled={!resolvedCanNext}
			title={nextLabel}
			aria-label={nextLabel}
			onclick={goNext}
		>
			<IconChevronRight size={16} stroke={2} aria-hidden="true" />
		</button>
	</nav>
</div>
