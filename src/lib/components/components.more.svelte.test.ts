import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import '@testing-library/jest-dom/vitest';

import Alert from './Alert.svelte';
import Toast from './Toast.svelte';
import Switch from './Switch.svelte';
import Modal from './Modal.svelte';
import Popup from './Popup.svelte';
import BreadCrumbs from './BreadCrumbs.svelte';
import Timer from './Timer.svelte';
import InputField from './input/InputField.svelte';
import Textarea from './input/Textarea.svelte';
import Select from './Select.svelte';
import Notification from './notifications/Notification.svelte';

describe('Alert component', () => {
	it('renders alert role and forwards classes', () => {
		render(Alert, { props: { class: 'alert-warning' } });

		const alert = screen.getByRole('alert');
		expect(alert).toHaveClass('alert', 'alert-warning');
	});
});

describe('Toast component', () => {
	it('renders list of toast items and handles close callback', async () => {
		const onclose = vi.fn();
		const item = { type: 'success' as const, message: 'Saved successfully', class: 'custom-item' };

		render(Toast, {
			props: {
				items: [item],
				onclose
			}
		});

		const button = screen.getByRole('button', { name: 'Saved successfully' });
		expect(button).toHaveClass('alert', 'alert-success', 'custom-item');

		await fireEvent.click(button);
		expect(onclose).toHaveBeenCalledWith(item);
	});
});

describe('Switch component', () => {
	it('renders checkbox toggle classes and checked state', () => {
		render(Switch, {
			props: {
				styleType: 'primary',
				checked: true,
				class: 'my-switch'
			}
		});

		const checkbox = screen.getByRole('checkbox');
		expect(checkbox).toBeChecked();
		expect(checkbox).toHaveClass('toggle', 'toggle-primary', 'my-switch');
	});
});

describe('Modal component', () => {
	it('renders title and default action button', () => {
		render(Modal, {
			props: {
				title: 'Dialog title',
				btnText: 'Подтвердить'
			}
		});

		expect(screen.getByText('Dialog title')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Подтвердить' })).toBeInTheDocument();
	});
});

describe('Popup component', () => {
	it('renders dialog container with provided z-index and class', () => {
		render(Popup, {
			props: {
				zIndex: 12,
				class: 'popup-test'
			}
		});

		const popup = screen.getByRole('dialog');
		expect(popup).toHaveClass('popup', 'popup-test');
		expect(popup).toHaveStyle({ zIndex: '12' });
	});
});

describe('BreadCrumbs component', () => {
	const list = [
		{ title: 'Главная', href: '/' },
		{ title: 'Каталог', href: '/catalog' },
		{ title: 'Текущая' }
	];

	it('renders non-seo list with links except last item', () => {
		render(BreadCrumbs, { props: { list } });

		expect(screen.getByRole('link', { name: 'Главная' })).toHaveAttribute('href', '/');
		expect(screen.getByRole('link', { name: 'Каталог' })).toHaveAttribute('href', '/catalog');
		expect(screen.getByText('Текущая')).toBeInTheDocument();
	});

	it('renders seo microdata structure when seo=true', () => {
		const { container } = render(BreadCrumbs, { props: { list, seo: true } });
		expect(
			container.querySelector('ol[itemtype="http://schema.org/BreadcrumbList"]')
		).toBeInTheDocument();
		expect(container.querySelectorAll('meta[itemprop="position"]').length).toBe(3);
	});
});

describe('Input components', () => {
	it('InputField renders label and applies input classes', () => {
		render(InputField, {
			props: {
				id: 'username',
				label: 'Username',
				class: 'input-primary',
				placeholder: 'Type username'
			}
		});

		const input = screen.getByLabelText('Username');
		expect(input).toHaveAttribute('id', 'username');
		expect(input).toHaveClass('grow');
		expect(input.closest('.input')).toHaveClass('input', 'w-full', 'input-primary');
	});

	it('InputField password toggles visibility by button', async () => {
		render(InputField, {
			props: {
				label: 'Password',
				type: 'password',
				value: 'secret'
			}
		});

		const input = screen.getByLabelText('Password');
		const toggleButton = screen.getByRole('button', { name: 'Показать пароль' });

		expect(input).toHaveAttribute('type', 'password');
		await fireEvent.click(toggleButton);
		expect(input).toHaveAttribute('type', 'text');
		expect(screen.getByRole('button', { name: 'Скрыть пароль' })).toBeInTheDocument();
	});

	it('Textarea renders id and class names', () => {
		render(Textarea, {
			props: {
				id: 'about',
				class: 'textarea-secondary'
			}
		});

		const textarea = screen.getByRole('textbox');
		expect(textarea).toHaveAttribute('id', 'about');
		expect(textarea).toHaveClass('textarea', 'w-full', 'textarea-secondary');
	});

	it('Select renders placeholder and options', () => {
		render(Select, {
			props: {
				id: 'country',
				label: 'Country',
				options: [
					{ value: 'ru', label: 'Russia' },
					{ value: 'kz', label: 'Kazakhstan' }
				],
				placeholder: 'Choose country',
				value: ''
			}
		});

		const select = screen.getByLabelText('Country');
		expect(select).toHaveAttribute('id', 'country');
		expect(screen.getByRole('option', { name: 'Choose country' })).toHaveAttribute('value', '');
		expect(screen.getByRole('option', { name: 'Russia' })).toHaveAttribute('value', 'ru');
		expect(screen.getByRole('option', { name: 'Kazakhstan' })).toHaveAttribute('value', 'kz');
	});
});

describe('Timer component', () => {
	it('renders padded timer format mm:ss', () => {
		render(Timer, {
			props: {
				timer: 5,
				end: false
			}
		});

		const minutes = document.querySelector('.timer .minutes');
		const seconds = document.querySelector('.timer .seconds');

		expect(minutes).toHaveTextContent(/^\d{2}$/);
		expect(seconds).toHaveTextContent(/^:\d{2}$/);
	});
});

describe('Notification component', () => {
	it('renders title, optional text and opacity class', () => {
		render(Notification, {
			props: {
				notification: {
					title: 'Info',
					text: 'Some text'
				},
				opacity: true,
				index: 2
			}
		});

		expect(screen.getByText('Info')).toBeInTheDocument();
		expect(screen.getByText('Some text')).toBeInTheDocument();
		expect(document.querySelector('.card')).toHaveClass('card_opacity');
	});
});
