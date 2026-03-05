import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/notifications/Notifications.svelte';

const meta = {
	title: 'Components/notifications/Notifications',
	component: Component,
	tags: ['autodocs'],
	args: {
		items: {
			notificationsFirst: [
				{ title: 'Добро пожаловать', text: 'Спасибо за регистрацию.' },
				{ title: 'Профиль', text: 'Заполните данные профиля.' }
			],
			notificationsLast: [{ title: 'Напоминание', text: 'Проверьте новые сообщения.' }]
		}
	}
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
