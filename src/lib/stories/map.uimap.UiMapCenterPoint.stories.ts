import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from './MapMockDemo.svelte';

const meta = {
	title: 'Components/map/uimap/UiMapCenterPoint',
	component: Component,
	tags: ['autodocs'],
	args: {
		variant: 'center'
	}
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
