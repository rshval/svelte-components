<script lang="ts">
	import Button from '../components/Button.svelte';
	import Popup from '../components/Popup.svelte';

	let target: HTMLButtonElement | undefined = $state();
	let opened = $state(false);
	let placement:
		| 'top'
		| 'top-start'
		| 'top-end'
		| 'bottom'
		| 'bottom-start'
		| 'bottom-end'
		| 'right'
		| 'right-start'
		| 'right-end'
		| 'left'
		| 'left-start'
		| 'left-end' = $state('bottom-start');
</script>

<div class="flex min-h-56 flex-col items-start gap-4 p-10">
	<div class="flex flex-wrap gap-2">
		<select
			class="select-bordered select select-sm"
			bind:value={placement}
			aria-label="Popup placement"
		>
			<option value="bottom-start">Bottom start</option>
			<option value="bottom-end">Bottom end</option>
			<option value="top">Top</option>
			<option value="right">Right</option>
		</select>
		<button
			bind:this={target}
			type="button"
			class="btn btn-primary"
			onclick={() => (opened = !opened)}
		>
			{opened ? 'Close popup' : 'Open popup'}
		</button>
	</div>

	{#if opened}
		<Popup
			{target}
			{placement}
			class="rounded-box border border-base-300 bg-base-100 p-4 shadow-lg"
			onclose={() => (opened = false)}
		>
			<div class="w-64 space-y-3">
				<p class="font-medium">Quick actions</p>
				<button type="button" class="btn w-full justify-start btn-ghost btn-sm">Assign owner</button
				>
				<button type="button" class="btn w-full justify-start btn-ghost btn-sm">Set due date</button
				>
				<button type="button" class="btn w-full justify-start btn-outline btn-error btn-sm"
					>Remove</button
				>
			</div>
		</Popup>
	{/if}
</div>
