<script lang="ts">
	import { clickOutside } from '$lib/helpers/events.js';
	import { createId } from '$lib/helpers/id.js';
	import type { ModalProps } from './Modal.types.js';

	let {
		children,
		buttons,
		title,
		btnText,
		flex,
		btnDisabled,
		element = $bindable(),
		send = $bindable(),
		opened = $bindable(),
		onclose: onCloseProp,
		noActions = false,
		noAutoClose = false,
		class: className,
		classBox: classNameBox,
		styleBox,
		id,
		...props
	}: ModalProps = $props();

	function onClose(e: Event) {
		if (element?.open) {
			if (!noAutoClose) {
				element?.close();
			} else {
				onCloseProp?.(e);
			}
		}
	}

	function handleNativeClose(e: Event) {
		if (opened !== undefined) {
			opened = false;
		}
		onCloseProp?.(e);
	}

	function getSendHandler() {
		if (typeof send !== 'function') return undefined;
		return (event: MouseEvent) => send(event);
	}

	$effect(() => {
		if (!element || !element.isConnected) return;
		if (opened === undefined) return;

		if (opened && !element.open) {
			element.showModal();
		}

		if (!opened && element.open) {
			element.close();
		}
	});

	const generatedDialogId = createId('dialog');
	const dialogId = $derived(id ?? generatedDialogId);
</script>

<dialog
	id={dialogId}
	bind:this={element}
	onclose={handleNativeClose}
	class={['modal', 'modal-bottom', 'sm:modal-middle', 'overflow-hidden', className]}
	{...props}
>
	<div
		class={['modal-box max-h-[calc(100dvh-2rem)] min-h-26 overflow-y-auto', classNameBox]}
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
						<button class="btn" disabled={btnDisabled} onclick={getSendHandler()}
							>{btnText ? btnText : 'Submit'}</button
						>
					{/if}
				</form>
			</div>
		{/if}
	</div>
</dialog>
