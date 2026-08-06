import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from './TableFiltersDemo.svelte';
import CompactComponent from './TableFiltersCompactDemo.svelte';

const meta = {
	title: 'Components/table/TableFilters',
	component: Component,
	tags: ['autodocs']
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Framed: Story = {
	args: {
		framed: true
	}
};

export const Compact: StoryObj<typeof CompactComponent> = {
	render: () => ({
		Component: CompactComponent
	})
};
