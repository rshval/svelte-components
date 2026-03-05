<script lang="ts">
	const {
		checked = $bindable(),
		class: className,
		styleType = 'neutral',
		...props
	}: {
		styleType?:
			| 'primary'
			| 'secondary'
			| 'accent'
			| 'neutral'
			| 'info'
			| 'success'
			| 'warning'
			| 'error';
		checked?: boolean;
		disabled?: boolean;
		onchange?: any;
		class?: any;
	} = $props();
</script>

<input type="checkbox" class={['toggle', 'toggle-' + styleType, className]} {checked} {...props} />

<style>
	[type='checkbox']:focus {
		box-shadow:
			var(--handleoffsetcalculator) 0 0 2px var(--tglbg) inset,
			0 0 0 2px var(--tglbg) inset,
			var(--togglehandleborder) !important;
	}
	/* .toggle:checked {
		background-color: var(--fallback-s, oklch(var(--s) / var(--tw-bg-opacity)));
	} */
</style>
