<script lang="ts">
	import { type Snippet } from 'svelte';
	import { createId } from '$lib/helpers/id.js';
	let {
		value = $bindable(),
		class: className,
		id,
		...props
	}: {
		value?: string | number;
		children?: Snippet;
		onchange?: any;
		class?: any;
		style?: any;
		row?: any;
		type?: string;
		disabled?: boolean;
		placeholder?: string;
		min?: string | number;
		max?: string | number;
		onblur?: any;
		onfocus?: any;
		id?: string;
	} = $props();

	const generatedTextareaId = createId('textarea');
	const textareaId = $derived(id ?? generatedTextareaId);
</script>

<textarea id={textareaId} bind:value class={['textarea', 'w-full', className]} {...props}
></textarea>
