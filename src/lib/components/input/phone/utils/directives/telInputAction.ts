import { inspectAllowedChars, inputParser } from '../index.js';
import type { CountryCode, E164Number } from '../../types/index.js';

export const telInputAction = (
	node: HTMLInputElement,
	{
		handler,
		spaces,
		shouldExtractCallingCode
	}: {
		handler: (val: string, extractedCountry?: CountryCode) => void;
		spaces?: boolean;
		shouldExtractCallingCode?: boolean;
		value: string | E164Number | undefined;
	}
) => {
	let actionHandler = handler;
	let allowSpaces = spaces;
	let allowCallingCodeExtract = shouldExtractCallingCode;

	const onInput = (event: Event) => {
		if (node && node.contains(event.target as HTMLInputElement)) {
			const currentValue = (event.target as HTMLInputElement).value;
			let normalizedInput = inputParser(currentValue, {
				parseCharacter: inspectAllowedChars,
				allowSpaces: false
			});

			let extractedCountry: CountryCode | undefined;
			if (allowCallingCodeExtract && normalizedInput) {
				if (normalizedInput.startsWith('+7')) {
					normalizedInput = normalizedInput.slice(2);
					extractedCountry = 'RU';
				} else if (/^8\d{10}$/.test(normalizedInput)) {
					normalizedInput = normalizedInput.slice(1);
					extractedCountry = 'RU';
				}
			}

			const formattedInput = inputParser(normalizedInput, {
				parseCharacter: inspectAllowedChars,
				allowSpaces: allowSpaces
			});
			node.value = formattedInput;
			actionHandler(formattedInput, extractedCountry);
		}
	};

	node.addEventListener('input', onInput, true);
	return {
		update(params: {
			handler: (val: string, extractedCountry?: CountryCode) => void;
			spaces: boolean;
			shouldExtractCallingCode?: boolean;
			value: string | E164Number | undefined;
		}) {
			actionHandler = params.handler;
			allowSpaces = params.spaces;
			allowCallingCodeExtract = params.shouldExtractCallingCode;
			if (params.value === undefined || params.value === '') {
				node.value = '';
			}
		},
		destroy() {
			node.removeEventListener('input', onInput, true);
		}
	};
};
