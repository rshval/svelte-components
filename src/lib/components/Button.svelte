<script lang="ts">
	import { type Snippet } from 'svelte';
	const {
		children,
		class: className,
		...props
	}: {
		type?: 'button' | 'submit' | 'reset';
		children?: Snippet;
		onclick?: (event: MouseEvent) => void;
		class?: any;
		style?: string;
		disabled?: boolean;
		title?: string;
		'aria-label'?: string;
		'aria-pressed'?: boolean | 'true' | 'false' | 'mixed' | null;
	} = $props();
</script>

<button class={['btn', className]} {...props}>{@render children?.()}</button>
