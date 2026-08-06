import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from './TableStackDemo.svelte';

const meta = {
	title: 'Components/table/TableStack',
	component: Component,
	tags: ['autodocs']
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FiltersSortAndPagination: Story = {};
