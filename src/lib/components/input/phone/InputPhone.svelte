<script lang="ts">
	import { TelInput, normalizedCountries } from './index.js';
	import type { DetailedValue, E164Number, CountryCode, TelInputOptions } from './types/index.js';

	let {
		disabled = false,
		disabledCountry = false,
		// E164 formatted value, usually you should store and use this.
		value = $bindable(),
		// Selected country
		country = $bindable('RU'),
		element = $bindable(),
		// Validity
		valid = $bindable(),
		// Phone number details
		detailedValue = $bindable(),
		options = $bindable(),
		class: className,
		onInput,
		inputClass = '',
		inputId
	}: {
		disabled?: boolean;
		disabledCountry?: boolean;
		value: string | E164Number | undefined;
		country?: CountryCode | undefined;
		element?: HTMLInputElement | undefined | null;
		valid: boolean;
		detailedValue?: Partial<DetailedValue>;
		options?: TelInputOptions;
		class?: any;
		inputClass?: any;
		onInput?: any;
		inputId?: string;
		widthFull?: boolean;
	} = $props();
</script>

<div class={['join', 'w-full', className]}>
	<select
		class="select-bordered select join-item max-w-26 min-w-20"
		aria-label="tel select"
		disabled={disabledCountry}
		name="Country"
		bind:value={country}
	>
		<option value={undefined} hidden={country !== undefined} disabled selected>Страна</option>
		{#each normalizedCountries as currentCountry (currentCountry.id)}
			<option
				value={currentCountry.iso2}
				selected={currentCountry.iso2 === country}
				aria-selected={currentCountry.iso2 === country}
			>
				{currentCountry.iso2} (+{currentCountry.dialCode})
			</option>
		{/each}
	</select>
	<TelInput
		{options}
		bind:country
		bind:valid
		bind:value
		shouldExtractCallingCode={!disabledCountry}
		{disabled}
		bind:el={element}
		{detailedValue}
		oninput={onInput}
		id={inputId}
		class="input-bordered input join-item w-full {inputClass}"
	/>
</div>
