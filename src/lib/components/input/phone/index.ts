export { default as TelInput } from './InputTextIndex.svelte';
export { default as InputPhone } from './InputPhone.svelte';
export {
	getCurrentCountry,
	inputParser,
	inspectAllowedChars,
	normalizeTelInput,
	getCountryForPartialE164Number,
	clickOutsideAction,
	isSelected
} from './utils/index.js';
export type { E164Number } from './types/index.js';
export { parsePhoneNumberWithError, ParseError } from 'libphonenumber-js/max';
export { normalizedCountries } from './assets/index.js';
