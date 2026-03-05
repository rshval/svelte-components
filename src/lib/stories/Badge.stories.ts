import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/Badge.svelte';

const meta = {
	title: 'Components/Badge',
	component: Component,
	tags: ['autodocs']
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
