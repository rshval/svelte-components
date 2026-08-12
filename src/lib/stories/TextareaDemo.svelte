<script lang="ts">
	import Textarea from '../components/input/Textarea.svelte';

	let notes = $state('Customer asked to receive updates every Friday.');
</script>

<div class="grid max-w-3xl gap-4 md:grid-cols-2">
	<label class="form-control">
		<span class="label-text">Notes</span>
		<Textarea bind:value={notes} placeholder="Add internal notes" row={5} />
	</label>
	<label class="form-control">
		<span class="label-text">Empty</span>
		<Textarea placeholder="Describe the issue" row={5} />
	</label>
	<label class="form-control">
		<span class="label-text">Error</span>
		<Textarea class="textarea-error" value="Too short" row={4} />
	</label>
	<label class="form-control">
		<span class="label-text">Disabled</span>
		<Textarea value="This text cannot be edited." disabled row={4} />
	</label>
</div>
