import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/qr/QrScanner.svelte';

const meta = {
	title: 'Components/qr/QrScanner',
	component: Component,
	tags: ['autodocs'],
	args: {
		autoStart: false,
		highlightFrame: true,
		showScanResult: true
	}
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
