import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from './TablePaginationDemo.svelte';
import TablePagination from '../components/table/TablePagination.svelte';

const meta = {
	title: 'Components/table/TablePagination',
	component: Component,
	tags: ['autodocs']
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {};

export const ShortList: StoryObj<typeof TablePagination> = {
	render: (args) => ({
		Component: TablePagination,
		props: args
	}),
	args: {
		total: 8,
		page: 1,
		limit: 10,
		limitOptions: [10, 25, 50]
	}
};

export const WithoutPageNumbers: StoryObj<typeof TablePagination> = {
	render: (args) => ({
		Component: TablePagination,
		props: args
	}),
	args: {
		total: 42,
		page: 2,
		limit: 10,
		showPages: false,
		pageLabel: 'Page 2'
	}
};

export const Localized: StoryObj<typeof TablePagination> = {
	render: (args) => ({
		Component: TablePagination,
		props: args
	}),
	args: {
		total: 42,
		page: 2,
		limit: 10,
		rangeSeparator: 'de',
		rowsPerPageLabel: 'Filas por pagina',
		previousLabel: 'Pagina anterior',
		nextLabel: 'Pagina siguiente',
		paginationLabel: 'Paginacion de tabla'
	}
};
