import { createPopper } from '@popperjs/core';

export default function createPopperAction() {
	let popperElement: HTMLElement | null;
	let popperTooltip: HTMLElement | null;
	let popperParams: object | undefined;
	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	let popper: any | null;

	function initialisePopper() {
		if (popperElement && popperTooltip) {
			popper = createPopper(popperElement, popperTooltip, popperParams);
		}
	}

	function destroyPopper() {
		if (popper) {
			popper.destroy();
			popper = null;
		}
	}

	function usePopperElement(element: HTMLElement) {
		// params?: object | undefined
		popperElement = element;
		initialisePopper();
		return {
			destroy() {
				popperElement = null;
				destroyPopper();
			}
		};
	}
	function usePopperToolip(element: HTMLElement, params?: object | undefined) {
		popperTooltip = element;
		popperParams = params;
		initialisePopper();

		return {
			update(newParams: object) {
				popperParams = newParams;
				if (popper) popper.setOptions(popperParams);
			},
			destroy() {
				popperTooltip = null;
				destroyPopper();
			}
		};
	}
	return [usePopperElement, usePopperToolip];
}
