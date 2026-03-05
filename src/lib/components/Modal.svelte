<script lang="ts">
	import type { Snippet } from 'svelte';
	import { clickOutside } from '$lib/helpers/events.js';
	import { createId } from '$lib/helpers/id.js';

	let {
		children,
		buttons,
		title,
		btnText,
		flex,
		btnDisabled,
		element = $bindable(),
		send = $bindable(),
		noActions = false,
		noAutoClose = false,
		class: className,
		classBox: classNameBox,
		styleBox,
		id,
		...props
	}: {
		children?: Snippet;
		buttons?: Snippet;
		title?: string;
		flex?: boolean;
		btnDisabled?: boolean;
		element?: HTMLDialogElement | undefined;
		send?: any;
		onclose?: any;
		btnText?: string;
		noActions?: boolean;
		noAutoClose?: boolean;
		class?: any;
		classBox?: any;
		styleBox?: any;
		id?: string;
	} = $props();

	function onClose(e: Event) {
		if (element?.open) {
			if (!noAutoClose) {
				element?.close();
			}
			props.onclose?.(e);
		}
	}
	const generatedDialogId = createId('dialog');
	const dialogId = $derived(id ?? generatedDialogId);
</script>

<dialog
	id={dialogId}
	bind:this={element}
	class={['modal', 'modal-bottom', 'sm:modal-middle', className]}
	{...props}
>
	<div
		class={['modal-box min-h-26', classNameBox]}
		style={styleBox}
		use:clickOutside={onClose}
		class:flex
		class:flex-col={flex}
	>
		{#if title}
			<h3 class="text-lg font-bold">{title}</h3>
		{/if}

		{@render children?.()}

		{#if !noActions}
			<div class="modal-action">
				<form method="dialog" class="modal-backdrop">
					{#if buttons}
						{@render buttons?.()}
					{:else}
						<button class="btn" disabled={btnDisabled} onclick={send}
							>{btnText ? btnText : 'Отправить'}</button
						>
					{/if}
				</form>
			</div>
		{/if}
	</div>
</dialog>
