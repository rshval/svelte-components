import type { Meta, StoryObj } from '@storybook/sveltekit';
import { fn } from 'storybook/test';
import Component from '../components/input/uploader/ImagesUploaderItem.svelte';

const previewImage =
	'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 120 120%22%3E%3Crect width=%22120%22 height=%22120%22 fill=%22%23dbeafe%22/%3E%3Ccircle cx=%2260%22 cy=%2250%22 r=%2222%22 fill=%22%232563eb%22/%3E%3Cpath d=%22M18 100 48 70l18 18 14-14 24 26z%22 fill=%22%231e40af%22/%3E%3C/svg%3E';

const meta = {
	title: 'Components/input/uploader/ImagesUploaderItem',
	component: Component,
	tags: ['autodocs'],
	args: {
		src: previewImage,
		assetsPost: '/api/assets',
		selected: false,
		disabled: false,
		onmain: fn(),
		oncancel: fn(),
		onremove: fn(),
		onload: fn(),
		onerror: fn()
	}
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
	args: {
		selected: true
	}
};

export const Empty: Story = {
	args: {
		src: undefined
	}
};

export const Disabled: Story = {
	args: {
		disabled: true
	}
};
