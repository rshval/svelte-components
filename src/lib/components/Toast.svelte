<script lang="ts">
	const closeTimers = new Map<string, ReturnType<typeof setTimeout>>();

	let {
		onclose,
		items = [],
		timeout,
		class: className
	}: {
		class?: string;
		items?: { type: 'info' | 'alert' | 'success'; message: string; class?: string }[];
		timeout?: number;
		onclose?: (item: {
			type: 'info' | 'alert' | 'success';
			message: string;
			class?: string;
		}) => void;
	} = $props();

	function getItemKey(item: { type: 'info' | 'alert' | 'success'; message: string; class?: string }, index: number) {
		return `${item.type}_${item.message}_${item.class ?? ''}_${index}`;
	}

	function closeItem(item: { type: 'info' | 'alert' | 'success'; message: string; class?: string }, key?: string) {
		if (key) {
			const timer = closeTimers.get(key);
			if (timer) {
				clearTimeout(timer);
				closeTimers.delete(key);
			}
		}

		onclose?.(item);
	}

	$effect(() => {
		if (!timeout || timeout <= 0) {
			for (const timer of closeTimers.values()) {
				clearTimeout(timer);
			}
			closeTimers.clear();
			return;
		}

		const activeKeys = new Set<string>();

		items.forEach((item, index) => {
			const key = getItemKey(item, index);
			activeKeys.add(key);

			if (!closeTimers.has(key)) {
				closeTimers.set(
					key,
					setTimeout(() => {
						closeTimers.delete(key);
						onclose?.(item);
					}, timeout)
				);
			}
		});

		for (const [key, timer] of closeTimers.entries()) {
			if (!activeKeys.has(key)) {
				clearTimeout(timer);
				closeTimers.delete(key);
			}
		}
	});
</script>

<div class={['toast', 'toast-end', className]}>
	{#if items?.length}
		{#each items as item, index (getItemKey(item, index))}
			<button
				type="button"
				class={['alert', item.type === 'alert' ? 'alert-error' : `alert-${item.type}`, item.class]}
				onclick={() => closeItem(item, getItemKey(item, index))}
			>
				<span>{item.message}</span>
			</button>
		{/each}
	{/if}
</div>
