<script lang="ts">
	import type { Snippet } from 'svelte';
	import { createId } from '$lib/helpers/id.js';
	let {
		value = $bindable(),
		class: className,
		type = 'text',
		id,
		label,
		...props
	}: {
		value?: string | number | null;
		children?: Snippet;
		onchange?: (event: Event) => void;
		onfocus?: (event: FocusEvent) => void;
		label?: string;
		class?: string;
		style?: string;
		type?: string;
		disabled?: boolean;
		placeholder?: string;
		min?: number | null;
		max?: number | null;
		maxlength?: number | null;
		id?: string;
	} = $props();

	const generatedInputId = createId('input');
	const inputId = $derived(id ?? generatedInputId);
</script>

{#if label}
	<div class="form-control">
		<label class="label" for={inputId}>
			<span class="label-text">{label}</span>
			<input
				id={inputId}
				{type}
				bind:value
				class={['input', 'w-full', className].filter(Boolean).join(' ')}
				{...props}
			/>
		</label>
	</div>
{:else}
	<input
		id={inputId}
		{type}
		bind:value
		class={['input', 'w-full', className].filter(Boolean).join(' ')}
		{...props}
	/>
{/if}
