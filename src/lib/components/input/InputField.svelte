<script lang="ts">
	import IconEye from '@tabler/icons-svelte-runes/icons/eye';
	import IconEyeOff from '@tabler/icons-svelte-runes/icons/eye-off';
	import { createId } from '$lib/helpers/id.js';
	import type { InputFieldProps } from './InputField.types.js';

	let {
		value = $bindable(),
		class: className,
		type = 'text',
		id,
		label,
		passwordToggle = true,
		oninput,
		onchange,
		onfocus,
		onblur,
		onkeydown,
		...props
	}: InputFieldProps = $props();

	let passwordVisible = $state(false);
	const inputType = $derived(type === 'password' && passwordVisible ? 'text' : type);
	const showPasswordToggle = $derived(type === 'password' && passwordToggle);

	const generatedInputId = createId('input');
	const inputId = $derived(id ?? generatedInputId);
</script>

{#snippet control()}
	<div class={['input', 'w-full', className].filter(Boolean).join(' ')}>
		<input
			id={inputId}
			type={inputType}
			bind:value
			class="grow"
			{oninput}
			{onchange}
			{onfocus}
			{onblur}
			{onkeydown}
			{...props}
		/>
		{#if showPasswordToggle}
			<button
				type="button"
				class="btn btn-ghost btn-xs"
				tabindex="-1"
				onclick={() => (passwordVisible = !passwordVisible)}
				aria-label={passwordVisible ? 'Скрыть пароль' : 'Показать пароль'}
				disabled={Boolean(props.disabled)}
			>
				{#if passwordVisible}
					<IconEyeOff size={18} />
				{:else}
					<IconEye size={18} />
				{/if}
			</button>
		{/if}
	</div>
{/snippet}

{#if label}
	<div class="form-control">
		<label class="label" for={inputId}>
			<span class="label-text">{label}</span>
			{@render control()}
		</label>
	</div>
{:else}
	{@render control()}
{/if}
