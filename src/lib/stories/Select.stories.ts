import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/Select.svelte';

const options = [
	{ value: 'new', label: 'Новый' },
	{ value: 'processing', label: 'В обработке' },
	{ value: 'done', label: 'Выполнен' }
];

const meta = {
	title: 'Components/Select',
	component: Component,
	tags: ['autodocs'],
	args: {
		label: 'Статус',
		placeholder: 'Выберите статус',
		options,
		value: ''
	}
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
	args: {
		value: 'processing'
	}
};
