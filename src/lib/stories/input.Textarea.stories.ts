import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/input/Textarea.svelte';

const meta = {
	title: 'Components/input/Textarea',
	component: Component,
	tags: ['autodocs']
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
