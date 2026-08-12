import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/Select.svelte';

const options = [
	{ value: 'new', label: 'New' },
	{ value: 'processing', label: 'Processing' },
	{ value: 'done', label: 'Done' }
];

const meta = {
	title: 'Components/Select',
	component: Component,
	tags: ['autodocs'],
	args: {
		label: 'Status',
		placeholder: 'Choose status',
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

export const Required: Story = {
	args: {
		required: true,
		value: ''
	}
};

export const Disabled: Story = {
	args: {
		disabled: true,
		value: 'done'
	}
};

export const EmptyOptions: Story = {
	args: {
		label: 'Assignee',
		placeholder: 'No assignees available',
		options: [],
		value: ''
	}
};
