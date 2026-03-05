<script lang="ts">
	import { fly } from 'svelte/transition';
	import { animationDelay, animationDuration } from '$lib/constants.js';
	import type { NotificationType } from './notifications.js';

	let {
		notification,
		index,
		onclick,
		opacity,
		...props
	}: {
		notification: NotificationType & { text?: string };
		index?: number;
		onclick?: (event: MouseEvent) => void;
		opacity: boolean;
	} = $props();
</script>

<div
	class="notification card__wrap w-full max-w-sm"
	style="z-index:{index}"
	in:fly|local={{ y: 50, duration: animationDuration * 2, delay: animationDelay }}
	out:fly|local={{ x: -250, duration: animationDuration * 2 }}
>
	<div
		class="card w-full bg-base-200 shadow-md"
		class:card_opacity={opacity}
		role="none"
		{onclick}
		{...props}
	>
		<div class="card-body p-4 pr-6 pl-6">
			<h2 class="card-title text-xs">{notification.title}</h2>
			{#if notification.text}
				<p class="text-xs">{notification.text}</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.card {
		opacity: 1 !important;
	}
	.card_opacity {
		opacity: 0.9 !important;
	}
	.notification {
		cursor: pointer;
	}
</style>
