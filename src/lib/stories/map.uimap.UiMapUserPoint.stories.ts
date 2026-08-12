import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from './MapMockDemo.svelte';

const meta = {
	title: 'Components/map/uimap/UiMapUserPoint',
	component: Component,
	tags: ['autodocs'],
	args: {
		variant: 'user'
	}
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
