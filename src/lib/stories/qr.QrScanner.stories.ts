import type { Meta, StoryObj } from '@storybook/sveltekit';
import { fn } from 'storybook/test';
import Component from '../components/qr/QrScanner.svelte';

const meta = {
	title: 'Components/qr/QrScanner',
	component: Component,
	tags: ['autodocs'],
	args: {
		autoStart: false,
		highlightFrame: true,
		showScanResult: true,
		class: 'max-w-80',
		ondetect: fn(),
		onerror: fn()
	}
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutFrame: Story = {
	args: {
		highlightFrame: false
	}
};

export const Compact: Story = {
	args: {
		class: 'max-w-52'
	}
};
