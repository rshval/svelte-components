<script lang="ts">
	import Button from '../Button.svelte';

	let {
		total = 0,
		page = 1,
		limit = 20,
		limitOptions = [10, 20, 50],
		class: className = '',
		summary,
		pageLabel,
		showLimit = true,
		onLimitChange,
		onPrev,
		onNext,
		canPrev = true,
		canNext = true
	}: {
		total?: number;
		page?: number;
		limit?: number;
		limitOptions?: number[];
		class?: string;
		summary?: string;
		pageLabel?: string;
		showLimit?: boolean;
		onLimitChange?: (value: number) => void;
		onPrev?: () => void;
		onNext?: () => void;
		canPrev?: boolean;
		canNext?: boolean;
	} = $props();
</script>

<div class={['mt-4 flex items-center justify-between gap-3', className]}>
	<p class="text-sm text-base-content/70">{summary || `Всего: ${total}`}</p>
	<div class="flex items-center gap-2">
		{#if showLimit}
			<select
				class="select-bordered select select-sm"
				value={limit}
				onchange={(e) => onLimitChange?.(Number((e.target as HTMLSelectElement).value || limit))}
			>
				{#each limitOptions as option}
					<option value={option}>{option}</option>
				{/each}
			</select>
		{/if}
		<Button class="btn-outline btn-sm" disabled={!canPrev} onclick={onPrev}>Назад</Button>
		<span class="text-sm">{pageLabel || `Стр. ${page}`}</span>
		<Button class="btn-outline btn-sm" disabled={!canNext} onclick={onNext}>Вперёд</Button>
	</div>
</div>
