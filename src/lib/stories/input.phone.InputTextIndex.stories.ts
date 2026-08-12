import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/input/phone/InputTextIndex.svelte';

const meta = {
	title: 'Components/input/phone/InputTextIndex',
	component: Component,
	tags: ['autodocs'],
	args: {
		value: '+79991234567',
		country: 'RU',
		valid: true
	}
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const International: Story = {
	args: {
		value: '+14155550132',
		country: 'US',
		options: {
			format: 'international'
		}
	}
};

export const Readonly: Story = {
	args: {
		readonly: true
	}
};

export const Disabled: Story = {
	args: {
		disabled: true
	}
};
