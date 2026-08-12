import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from './ToastDemo.svelte';

const meta = {
	title: 'Components/Toast',
	component: Component,
	tags: ['autodocs']
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
