import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from './NotificationsDemo.svelte';

const meta = {
	title: 'Components/notifications/Notifications',
	component: Component,
	tags: ['autodocs']
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
