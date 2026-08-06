import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/table/Table.svelte';
import TableActionsCell from './TableActionsCell.svelte';
import TableActiveCell from './TableActiveCell.svelte';

const rows = [
	{ id: '1', name: 'Anna Keller', role: 'Manager', score: 82, status: 'Active', active: true },
	{ id: '2', name: 'Ilya Morozov', role: 'Operator', score: 71, status: 'Paused', active: false },
	{ id: '3', name: 'Mira Stone', role: 'Admin', score: 95, status: 'Active', active: true },
	{ id: '4', name: 'Noah Reed', role: 'Support', score: 64, status: 'Pending', active: false }
];
const rowsByScoreDesc = [...rows].sort((a, b) => b.score - a.score);

const columns: Components.Table.Column[] = [
	{ id: 'name', title: 'Name', sortable: true },
	{ id: 'role', title: 'Role', sortable: true },
	{ id: 'score', title: 'Score', sortable: true, sortType: 'number', align: 'right' },
	{ id: 'status', title: 'Status' }
];

const columnsWithCustomCells: Components.Table.Column[] = [
	...columns,
	{
		id: 'active',
		title: 'Enabled',
		component: TableActiveCell,
		props: {},
		propsFn: (row) => ({ row })
	},
	{
		id: 'actions',
		title: '',
		align: 'right',
		component: TableActionsCell,
		props: {},
		propsFn: (row) => ({ row })
	}
];

const meta = {
	title: 'Components/table/Table',
	component: Component,
	tags: ['autodocs'],
	args: {
		columns,
		rows,
		hover: true
	}
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SortableZebra: Story = {
	args: {
		zebra: true,
		class: 'table-sm'
	}
};

export const CustomCells: Story = {
	args: {
		columns: columnsWithCustomCells,
		rows,
		hover: true,
		zebra: true,
		class: 'table-sm'
	}
};

export const ControlledSort: Story = {
	args: {
		rows: rowsByScoreDesc,
		sortBy: 'score',
		sortDirection: 'desc',
		manualSort: true,
		class: 'table-sm'
	}
};

export const Empty: Story = {
	args: {
		rows: [],
		emptyLabel: 'No team members found.'
	}
};
