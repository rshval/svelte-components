import { inspectAllowedChars, inputParser } from '../index.js';
import type { E164Number } from 'libphonenumber-js';
export const telInputAction = (
	node: HTMLInputElement,
	{
		handler,
		spaces
	}: {
		handler: (val: string) => void;
		spaces?: boolean;
		value: string | E164Number | undefined;
	}
) => {
	const onInput = (event: Event) => {
		if (node && node.contains(event.target as HTMLInputElement)) {
			const currentValue = (event.target as HTMLInputElement).value;
			const formattedInput = inputParser(currentValue, {
				parseCharacter: inspectAllowedChars,
				allowSpaces: spaces
			});
			node.value = formattedInput;
			handler(formattedInput);
		}
	};
	node.addEventListener('input', onInput, true);
	return {
		update(params: {
			handler: (val: string) => void;
			spaces: boolean;
			value: string | E164Number | undefined;
		}) {
			if (params.value === undefined || params.value === '') {
				node.value = '';
			}
		},
		destroy() {
			node.removeEventListener('input', onInput, true);
		}
	};
};
