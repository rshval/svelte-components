<script lang="ts">
	import { tick } from 'svelte';
	import { parsePhoneNumberWithError, ParseError } from 'libphonenumber-js/max';
	import {
		normalizeTelInput,
		getCountryForPartialE164Number,
		generatePlaceholder,
		telInputAction,
		allowedCharacters
	} from './utils/index.js';
	import type { DetailedValue, CountryCode, E164Number, TelInputOptions } from './types/index.js';

	const defaultOptions = {
		autoPlaceholder: true,
		spaces: true,
		invalidateOnCountryChange: false,
		format: 'national'
	} satisfies TelInputOptions;

	let {
		/** It will overwrite the autoPlaceholder ! */
		placeholder = '',
		/** The core value of the input, this is the only one what you can store. It's an E164 phone number.*/
		value = $bindable(),
		/** It's accept any Country Code Alpha-2 (ISO 3166) */
		country = $bindable(),
		/** Detailed parse of the E164 phone number */
		detailedValue = $bindable(),
		/** Validity of the input based on the config settings.*/
		valid = $bindable(),
		/** You can turn on and off certain features by this object */
		options = defaultOptions,
		/** Binding to the underlying `<input>` element */
		el = $bindable(),
		updateCountry = $bindable(),
		parseError = $bindable(),
		updateDetailedValue = $bindable(),
		updateValid = $bindable(),
		updateValue = $bindable(),
		shouldExtractCallingCode = false,
		class: className,
		...props
	}: {
		id?: string;
		placeholder?: string;
		readonly?: boolean;
		disabled?: boolean;
		value: string | E164Number | undefined;
		country?: CountryCode;
		detailedValue?: Partial<DetailedValue>;
		valid: boolean;
		class?: string;
		options?: TelInputOptions;
		el?: HTMLInputElement | undefined | null;
		oninput?: (event: Event) => void;
		updateCountry?: CountryCode;
		parseError?: string;
		updateDetailedValue?: Partial<DetailedValue>;
		updateValid?: boolean;
		updateValue?: string | E164Number | undefined;
		shouldExtractCallingCode?: boolean;
	} = $props();

	let inputValue: string | E164Number | undefined = $state(value);
	let prevCountry = country;

	/** Merge options into default opts, to be able to set just one config option. */
	//TelInputOptions
	let combinedOptions: TelInputOptions = $state({});

	$effect(() => {
		combinedOptions = {
			...defaultOptions,
			...options
		};
	});

	const handleInputAction = (val: string, extractedCountry?: CountryCode) => {
		if (props.disabled || props.readonly) return;

		if (extractedCountry) {
			doUpdateCountry(extractedCountry);
		}

		handleParsePhoneNumber(val, extractedCountry ?? country);
	};

	// Update the country and dispatch event
	const doUpdateCountry = (countryCode: CountryCode) => {
		if (countryCode !== country) {
			country = countryCode;
			prevCountry = country;
			updateCountry = country;
		}
		return country;
	};

	const findNewCursorPosition = (
		newValue: string,
		formattedValue: string,
		initialCursorPosition: number
	) => {
		let fvIndex = 0;
		for (let nvIndex = 0; nvIndex < initialCursorPosition; nvIndex++) {
			// Since newValue has not been normalized yet, we need to map any non standard digits.
			const nvChar = allowedCharacters(newValue[nvIndex], { spaces: false });

			// For each non-formatting character encountered in the value entered by the user,
			// find the corresponding digit in the formatted value.
			if (nvChar >= '0' && nvChar <= '9') {
				while (
					!(formattedValue[fvIndex] >= '0' && formattedValue[fvIndex] <= '9') &&
					fvIndex < formattedValue.length
				) {
					fvIndex++;
				}
				fvIndex++;
			}
		}

		return fvIndex;
	};

	const handleParsePhoneNumber = async (
		rawInput: string | undefined,
		currCountry: CountryCode | undefined = undefined
	) => {
		const input = rawInput as E164Number;
		if (input) {
			const numberHasCountry = getCountryForPartialE164Number(input);

			if (numberHasCountry && numberHasCountry !== prevCountry) {
				doUpdateCountry(numberHasCountry);
			}

			try {
				detailedValue = normalizeTelInput(
					parsePhoneNumberWithError(input, numberHasCountry ?? currCountry ?? undefined)
				);
			} catch (err) {
				if (err instanceof ParseError) {
					detailedValue = {
						isValid: false,
						error: err.message
					};
					parseError = err.message;
				} else {
					throw err;
				}
			}

			const formatOption = combinedOptions.format === 'national' ? 'nationalNumber' : 'e164';
			const formattedValue =
				combinedOptions.format === 'national' ? 'formatOriginal' : 'formatInternational';
			const initialCursorPosition = el?.selectionStart || 0;
			if (combinedOptions.spaces && detailedValue?.[formattedValue]) {
				inputValue = detailedValue[formattedValue] ?? undefined;

				// Need to wait for input element to update before cursor position can be restored
				await tick();
				if (el) {
					const newCursorPosition = findNewCursorPosition(input, inputValue, initialCursorPosition);
					el.selectionStart = newCursorPosition;
					el.selectionEnd = newCursorPosition;
				}
			} else if (detailedValue?.[formatOption]) {
				inputValue = detailedValue[formatOption] ?? undefined;

				// Need to wait for input element to update before cursor position can be restored
				await tick();
				if (el) {
					const newCursorPosition = findNewCursorPosition(input, inputValue, initialCursorPosition);
					el.selectionStart = newCursorPosition;
					el.selectionEnd = newCursorPosition;
				}
			}

			// keep the input value as value
			value = detailedValue?.e164 ?? input ?? undefined;
			valid = detailedValue?.isValid ?? false;
			updateValid = valid;
			updateValue = value;
			updateDetailedValue = detailedValue;
		} else if (!input && currCountry) {
			// If the user modifies the country, reset the input value and don't dispatch the country change event.
			if (currCountry !== prevCountry) {
				prevCountry = currCountry;
				valid = !options.invalidateOnCountryChange;
				value = undefined;
				inputValue = undefined;
				detailedValue = undefined;
				updateValid = valid;
				updateValue = value;
				updateDetailedValue = detailedValue;
			}
		} else {
			// Otherwise, reset all values
			valid = true;
			value = undefined;
			detailedValue = undefined;
			prevCountry = currCountry;
			updateValid = valid;
			updateDetailedValue = detailedValue;
			inputValue = undefined;
		}
	};

	// Watch user's country change.
	let countryWatchInitRun = true;
	const countryChangeWatchFunction = (current: CountryCode | undefined) => {
		valid = false;
		if (!countryWatchInitRun) {
			handleParsePhoneNumber(undefined, current);
		}
		countryWatchInitRun = false;
	};

	$effect(() => {
		countryChangeWatchFunction(country);
	});

	let getPlaceholder: string | null | undefined = $state();
	// Generate placeholder based on the autoPlaceholder option
	$effect(() => {
		getPlaceholder =
			combinedOptions.autoPlaceholder && country
				? generatePlaceholder(country, {
						format: combinedOptions.format,
						spaces: combinedOptions.spaces
					})
				: placeholder;
	});

	// Handle reset value only
	$effect(() => {
		if (value === undefined && inputValue && detailedValue) {
			inputValue = undefined;
			detailedValue = undefined;
			updateDetailedValue = detailedValue;
		}
	});

	let valueIsInit = false;
	$effect(() => {
		if (!valueIsInit && value) {
			valueIsInit = true;
			const initialValue = String(value);
			handleParsePhoneNumber(
				initialValue,
				getCountryForPartialE164Number(initialValue as E164Number) || country
			);
		}
	});
</script>

<input
	{...props}
	bind:this={el}
	placeholder={getPlaceholder}
	type="tel"
	class={className}
	bind:value={inputValue}
	use:telInputAction={{
		handler: handleInputAction,
		spaces: combinedOptions.spaces,
		country,
		shouldExtractCallingCode,
		value
	}}
/>
