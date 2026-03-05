<script lang="ts">
	import { createId } from '$lib/helpers/id.js';

	let {
		label = '',
		value = $bindable(''),
		class: className,
		options = [] as Components.Select.Option[],
		placeholder = 'Выберите...',
		disabled = false,
		required = false,
		id
	}: {
		label?: string;
		value: string;
		class?: any;
		options: Components.Select.Option[]; // { value: string, label: string }
		placeholder?: string;
		disabled?: boolean;
		required?: boolean;
		id?: string;
	} = $props();

	const generatedSelectId = createId('select');
	const selectId = $derived(id ?? generatedSelectId);
</script>

<div class="form-control">
	{#if label}
		<label class="label" for={selectId}>
			<span class="label-text">{label}</span>
		</label>
	{/if}
	<select
		id={selectId}
		class={['select-bordered select w-full', className]}
		bind:value
		{disabled}
		{required}
	>
		<option value="" disabled selected={!value}>{placeholder}</option>
		{#each options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</div>
