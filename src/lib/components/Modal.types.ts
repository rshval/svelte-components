import type { Snippet } from 'svelte';

export type ModalBindableProps = {
	element?: HTMLDialogElement | undefined;
	send?: unknown;
	opened?: boolean | undefined;
};

export type ModalReadonlyProps = {
	children?: Snippet;
	buttons?: Snippet;
	title?: string;
	flex?: boolean;
	btnDisabled?: boolean;
	btnText?: string;
	noActions?: boolean;
	noAutoClose?: boolean;
	class?: any;
	classBox?: any;
	styleBox?: any;
	id?: string;
	onclose?: (event: Event) => void;
};

export type ModalProps = ModalBindableProps & ModalReadonlyProps;
