import type { HTMLInputAttributes } from 'svelte/elements';

export type InputFieldBindableProps = {
	value?: string | number | null;
};

export type InputFieldReadonlyProps = Omit<
	HTMLInputAttributes,
	'value' | 'type' | 'class' | 'oninput' | 'onchange' | 'onfocus' | 'onblur' | 'onkeydown'
> & {
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
	passwordToggle?: boolean;
	oninput?: (event: Event) => void;
	onchange?: (event: Event) => void;
	onfocus?: (event: FocusEvent) => void;
	onblur?: (event: FocusEvent) => void;
	onkeydown?: (event: KeyboardEvent) => void;
};

export type InputFieldProps = InputFieldBindableProps & InputFieldReadonlyProps;
