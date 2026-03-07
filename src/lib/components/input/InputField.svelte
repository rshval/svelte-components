<script lang="ts">
	import type { Snippet } from 'svelte';
	import IconEye from '@tabler/icons-svelte-runes/icons/eye';
	import IconEyeOff from '@tabler/icons-svelte-runes/icons/eye-off';
	import { createId } from '$lib/helpers/id.js';
	let {
		value = $bindable(),
		class: className,
		type = 'text',
		id,
		label,
		passwordToggle = true,
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
		passwordToggle?: boolean;
	} = $props();

	let passwordVisible = $state(false);
	const inputType = $derived(type === 'password' && passwordVisible ? 'text' : type);
	const showPasswordToggle = $derived(type === 'password' && passwordToggle);

	const generatedInputId = createId('input');
	const inputId = $derived(id ?? generatedInputId);
</script>

{#if label}
	<div class="form-control">
		<label class="label" for={inputId}>
			<span class="label-text">{label}</span>
			<div class={['input', 'w-full', className].filter(Boolean).join(' ')}>
				<input id={inputId} type={inputType} bind:value class="grow" {...props} />
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
		</label>
	</div>
{:else}
	<div class={['input', 'w-full', className].filter(Boolean).join(' ')}>
		<input id={inputId} type={inputType} bind:value class="grow" {...props} />
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
{/if}
