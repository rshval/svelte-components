import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/table/Table.svelte';

const columns = [
	{ id: 'name', title: 'Имя' },
	{ id: 'role', title: 'Роль' },
	{ id: 'status', title: 'Статус' }
];

const rows = [
	{ id: '1', name: 'Анна', role: 'Менеджер', status: 'active' },
	{ id: '2', name: 'Илья', role: 'Оператор', status: 'paused' }
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
