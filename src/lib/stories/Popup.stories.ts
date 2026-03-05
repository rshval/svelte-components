import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/Popup.svelte';

const meta = {
	title: 'Components/Popup',
	component: Component,
	tags: ['autodocs']
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
