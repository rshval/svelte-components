import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/input/Editor.svelte';

const meta = {
	title: 'Components/input/Editor',
	component: Component,
	tags: ['autodocs']
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
