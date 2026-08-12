<script lang="ts">
	import Notification from '../components/notifications/Notification.svelte';
	import Notifications from '../components/notifications/Notifications.svelte';

	const scheduledItems = {
		notificationsFirst: [
			{ title: 'Welcome', text: 'The first scheduled notification appears after 10 seconds.' },
			{ title: 'Profile', text: 'Complete the profile data.' }
		],
		notificationsLast: [{ title: 'Reminder', text: 'Check new messages.' }]
	};

	let stack = $state([
		{ title: 'New order', text: 'A new request appeared in the queue.' },
		{ title: 'Sync complete', text: 'Customer data is up to date.' }
	]);

	function addNotification() {
		stack = [
			...stack,
			{ title: 'Manual event', text: `Notification ${stack.length + 1} added from Storybook.` }
		];
	}
</script>

<div class="min-h-80">
	<div class="mb-4 flex flex-wrap gap-2">
		<button type="button" class="btn btn-primary" onclick={addNotification}>Add notification</button
		>
		<button type="button" class="btn btn-ghost" onclick={() => (stack = [])}>Clear preview</button>
	</div>

	<div class="stack max-w-sm">
		{#each stack as notification, index (`${notification.title}_${index}`)}
			<Notification
				{notification}
				{index}
				opacity={index + 1 < stack.length}
				onclick={() => (stack = stack.filter((_, itemIndex) => itemIndex !== index))}
			/>
		{/each}
	</div>

	<Notifications items={scheduledItems} />
</div>
