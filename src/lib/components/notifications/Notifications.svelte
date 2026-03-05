<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Notification from './Notification.svelte';
	import type { NotificationType } from './notifications.js';

	type NotificationViewModel = NotificationType & { text?: string };

	let {
		items
	}: {
		items: {
			notificationsFirst: NotificationViewModel[];
			notificationsLast: NotificationViewModel[];
		};
	} = $props();

	let stackArr: NotificationViewModel[] = $state([]);
	let timeoutFirst: ReturnType<typeof setTimeout> | undefined;
	let timeoutLast: ReturnType<typeof setTimeout> | undefined;

	const addRandomNotification = (arr: NotificationViewModel[]) => {
		if (!arr?.length) return;
		const index = Math.floor(Math.random() * arr.length);
		const next = arr[index];
		if (!next) return;
		stackArr = [...stackArr, next];
	};

	onMount(() => {
		timeoutFirst = setTimeout(() => addRandomNotification(items?.notificationsFirst ?? []), 10000);
		timeoutLast = setTimeout(() => addRandomNotification(items?.notificationsLast ?? []), 30000);
	});

	onDestroy(() => {
		if (timeoutFirst) clearTimeout(timeoutFirst);
		if (timeoutLast) clearTimeout(timeoutLast);
	});

	function onClickNotification(data: NotificationViewModel) {
		const index = stackArr.findIndex((n) => n === data);
		if (index === -1) return;
		stackArr = stackArr.filter((_, i) => i !== index);
	}
</script>

<div class="fixed right-1 bottom-1 z-10 p-4">
	<div class="stack">
		{#each stackArr as notification, index (`${notification.title}_${index}`)}
			<Notification
				{notification}
				{index}
				opacity={index + 1 < stackArr.length}
				onclick={() => onClickNotification(notification)}
			/>
		{/each}
	</div>
</div>
