<script lang="ts">
	import Button from '../components/Button.svelte';
	import Toast from '../components/Toast.svelte';

	type ToastItem = { type: 'info' | 'alert' | 'success'; message: string; class?: string };

	let items = $state<ToastItem[]>([
		{ type: 'info', message: 'Draft saved locally.' },
		{ type: 'success', message: 'Invite sent.' },
		{ type: 'alert', message: 'Payment method needs attention.' }
	]);

	function add(type: ToastItem['type']) {
		const message =
			type === 'success'
				? 'Changes published.'
				: type === 'alert'
					? 'Could not sync changes.'
					: 'Background refresh started.';
		items = [...items, { type, message }];
	}

	function close(item: ToastItem) {
		const index = items.indexOf(item);
		items = items.filter((_, itemIndex) => itemIndex !== index);
	}
</script>

<div class="min-h-72">
	<div class="flex flex-wrap gap-2">
		<Button class="btn-info" onclick={() => add('info')}>Add info</Button>
		<Button class="btn-success" onclick={() => add('success')}>Add success</Button>
		<Button class="btn-error" onclick={() => add('alert')}>Add error</Button>
		<Button class="btn-ghost" onclick={() => (items = [])}>Clear</Button>
	</div>

	<Toast {items} onclose={close} />
</div>
