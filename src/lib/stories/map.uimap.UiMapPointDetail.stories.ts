import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from './MapMockDemo.svelte';

const meta = {
	title: 'Components/map/uimap/UiMapPointDetail',
	component: Component,
	tags: ['autodocs'],
	args: {
		variant: 'detail'
	}
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
