export type InputFieldBindableProps = {
	value?: string | number | null;
};

export type InputFieldReadonlyProps = {
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
	onchange?: (event: Event) => void;
	onfocus?: (event: FocusEvent) => void;
};

export type InputFieldProps = InputFieldBindableProps & InputFieldReadonlyProps;
