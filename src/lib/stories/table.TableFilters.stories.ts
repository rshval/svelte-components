import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/table/TableFilters.svelte';

const meta = {
	title: 'Components/table/TableFilters',
	component: Component,
	tags: ['autodocs']
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
