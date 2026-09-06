<script lang="ts">
	import { getContext } from 'svelte';

	import { SWIPE_NAVIGATION_CONTEXT, type SwipeNavigationApi } from './context.js';

	let { text = 'Назад', class: className = '' } = $props<{
		text?: string;
		class?: string;
	}>();

	const navigation = getContext<SwipeNavigationApi>(SWIPE_NAVIGATION_CONTEXT);

	async function handleClick() {
		if (!navigation?.canGoBack()) {
			return;
		}

		await navigation.back();
	}
</script>

<button type="button" class={className} onclick={handleClick}>
	{text}
</button>
