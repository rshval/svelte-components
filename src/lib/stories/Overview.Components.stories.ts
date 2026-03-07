import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from './ComponentsShowcase.svelte';

const meta = {
	title: 'Overview/Components Showcase',
	component: Component,
	tags: ['autodocs']
} satisfies Meta<Component>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
