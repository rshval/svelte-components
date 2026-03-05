import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/notifications/Notification.svelte';

const meta = {
	title: 'Components/notifications/Notification',
	component: Component,
	tags: ['autodocs'],
	args: {
		notification: {
			title: 'Новый заказ',
			text: 'Появилась новая заявка в очереди.'
		},
		opacity: false,
		index: 1
	}
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Dimmed: Story = {
	args: {
		opacity: true
	}
};
