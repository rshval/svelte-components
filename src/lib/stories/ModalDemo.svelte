<script lang="ts">
	import Button from '../components/Button.svelte';
	import Modal from '../components/Modal.svelte';

	let opened = $state(false);
	let confirmOpened = $state(false);
	let lockedOpened = $state(false);
	let sentCount = $state(0);
</script>

<div class="flex flex-wrap gap-3">
	<Button class="btn-primary" onclick={() => (opened = true)}>Open default modal</Button>
	<Button class="btn-warning" onclick={() => (confirmOpened = true)}>Open confirmation</Button>
	<Button class="btn-outline" onclick={() => (lockedOpened = true)}>Open disabled action</Button>
</div>

<Modal bind:opened title="Edit customer" btnText="Save changes" send={() => sentCount++}>
	<div class="mt-4 space-y-3">
		<p class="text-sm">Use this modal for a short focused flow with one primary action.</p>
		<label class="form-control">
			<span class="label-text">Customer name</span>
			<input class="input-bordered input" value="Anna Keller" aria-label="Customer name" />
		</label>
		<p class="text-xs opacity-70">Submit clicks in this story: {sentCount}</p>
	</div>
</Modal>

<Modal bind:opened={confirmOpened} title="Archive project" noAutoClose>
	{#snippet buttons()}
		<button type="button" class="btn btn-ghost" onclick={() => (confirmOpened = false)}
			>Cancel</button
		>
		<button type="button" class="btn btn-error" onclick={() => (confirmOpened = false)}>
			Archive
		</button>
	{/snippet}

	<p class="mt-4 text-sm">This variant shows custom actions for a destructive confirmation.</p>
</Modal>

<Modal
	bind:opened={lockedOpened}
	title="Waiting for validation"
	btnText="Submit"
	btnDisabled
	styleBox="max-width: 32rem;"
>
	<p class="mt-4 text-sm">The primary action is disabled until the required data is valid.</p>
</Modal>
