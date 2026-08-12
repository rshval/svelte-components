import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/input/phone/InputPhone.svelte';

const meta = {
	title: 'Components/input/phone/InputPhone',
	component: Component,
	tags: ['autodocs'],
	args: {
		value: '+79991234567',
		country: 'RU',
		placeholder: 'Phone number'
	}
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
	args: {
		value: undefined,
		country: 'US'
	}
};

export const CountryLocked: Story = {
	args: {
		value: '+14155550132',
		country: 'US',
		disabledCountry: true
	}
};

export const Disabled: Story = {
	args: {
		disabled: true
	}
};
