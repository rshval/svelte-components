import type { Snippet } from 'svelte';

export type TableFiltersProps = {
	title?: string;
	count?: number | string;
	class?: string;
	bodyClass?: string;
	actions?: Snippet;
	children?: Snippet;
};
