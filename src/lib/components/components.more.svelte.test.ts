import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/svelte';
import '@testing-library/jest-dom/vitest';
import { tick } from 'svelte';
import { createRawSnippet } from 'svelte';

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
import Table from './table/Table.svelte';
import TableFilters from './table/TableFilters.svelte';
import TablePagination from './table/TablePagination.svelte';

afterEach(() => {
	cleanup();
});

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
		expect(screen.getByRole('button', { name: 'Подтвердить', hidden: true })).toBeInTheDocument();
	});

	it('renders content via snippets API', () => {
		const children = createRawSnippet(() => ({
			render: () => '<div>Snippet content</div>'
		}));
		const buttons = createRawSnippet(() => ({
			render: () => '<button type="button">Snippet action</button>'
		}));

		render(Modal, {
			props: {
				title: 'Snippet modal',
				children,
				buttons
			}
		});

		expect(screen.getByText('Snippet content')).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Snippet action', hidden: true })
		).toBeInTheDocument();
	});

	it('opens when bound opened state is true', async () => {
		const showModal = vi.fn(function (this: HTMLDialogElement) {
			Object.defineProperty(this, 'open', { configurable: true, value: true, writable: true });
		});

		const originalShowModal = HTMLDialogElement.prototype.showModal;

		HTMLDialogElement.prototype.showModal = showModal;

		try {
			render(Modal, {
				props: {
					opened: true,
					noActions: true
				}
			});

			await tick();
			expect(showModal).toHaveBeenCalledTimes(1);
		} finally {
			HTMLDialogElement.prototype.showModal = originalShowModal;
		}
	});

	it('keeps backward-compatible behavior when opened is not bound', async () => {
		const close = vi.fn();
		const originalClose = HTMLDialogElement.prototype.close;
		HTMLDialogElement.prototype.close = close;

		try {
			const view = render(Modal, {
				props: {
					title: 'Legacy open flow',
					noActions: true
				}
			});

			const dialog = document.querySelector('dialog') as HTMLDialogElement;
			Object.defineProperty(dialog, 'open', { configurable: true, value: true, writable: true });

			await view.rerender({ title: 'Legacy open flow 2', noActions: true });
			await tick();

			expect(close).not.toHaveBeenCalled();
		} finally {
			HTMLDialogElement.prototype.close = originalClose;
		}
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

describe('TableFilters component', () => {
	it('renders actions and children snippets', () => {
		const actions = createRawSnippet(() => ({
			render: () => '<button type="button">Snippet reset</button>'
		}));
		const children = createRawSnippet(() => ({
			render: () => '<input aria-label="search" />'
		}));

		render(TableFilters, {
			props: {
				title: 'Filters',
				actions,
				children
			}
		});

		expect(screen.getByRole('button', { name: 'Snippet reset' })).toBeInTheDocument();
		expect(screen.getByLabelText('search')).toBeInTheDocument();
	});

	it('can hide header while keeping actions visible', () => {
		const actions = createRawSnippet(() => ({
			render: () => '<button type="button">Reset compact</button>'
		}));

		render(TableFilters, {
			props: {
				title: 'Filters',
				count: 3,
				showHeader: false,
				actions
			}
		});

		expect(screen.queryByText('Filters')).not.toBeInTheDocument();
		expect(screen.queryByText('3')).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Reset compact' })).toBeInTheDocument();
	});
});

describe('Table component', () => {
	it('renders custom empty label when rows are empty', () => {
		render(Table, {
			props: {
				columns: [{ id: 'name', title: 'Name' }],
				rows: [],
				emptyLabel: 'Nothing here'
			}
		});

		expect(screen.getByText('Nothing here')).toBeInTheDocument();
	});

	it('sorts sortable columns with a tri-state cycle', async () => {
		render(Table, {
			props: {
				columns: [{ id: 'score', title: 'Score', sortable: true, sortType: 'number' }],
				rows: [
					{ id: '1', score: 20 },
					{ id: '2', score: 10 },
					{ id: '3', score: 15 }
				]
			}
		});

		const sortButton = screen.getByRole('button', { name: 'Score' });

		await fireEvent.click(sortButton);
		expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['10', '15', '20']);
		expect(sortButton.closest('th')).toHaveAttribute('aria-sort', 'ascending');

		await fireEvent.click(sortButton);
		expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['20', '15', '10']);
		expect(sortButton.closest('th')).toHaveAttribute('aria-sort', 'descending');

		await fireEvent.click(sortButton);
		expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['20', '10', '15']);
		expect(sortButton.closest('th')).toHaveAttribute('aria-sort', 'none');
	});

	it('renders a custom cell component without requiring static props', () => {
		render(Table, {
			props: {
				columns: [{ id: 'active', title: 'Active', component: Switch }],
				rows: [{ id: '1', active: true }]
			}
		});

		expect(screen.getByRole('checkbox')).toBeInTheDocument();
	});
});

describe('TablePagination component', () => {
	it('renders compact range summary and page buttons', async () => {
		const onPageChange = vi.fn();

		render(TablePagination, {
			props: {
				total: 42,
				page: 2,
				limit: 10,
				onPageChange
			}
		});

		expect(screen.getByText('11-20 of 42')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');

		await fireEvent.click(screen.getByRole('button', { name: '3' }));

		expect(onPageChange).toHaveBeenCalledWith(3);
	});

	it('supports localized range separator and aria labels', () => {
		render(TablePagination, {
			props: {
				total: 42,
				page: 2,
				limit: 10,
				rangeSeparator: 'de',
				rowsPerPageLabel: 'Filas por pagina',
				previousLabel: 'Pagina anterior',
				nextLabel: 'Pagina siguiente'
			}
		});

		expect(screen.getByText('11-20 de 42')).toBeInTheDocument();
		expect(screen.getByLabelText('Filas por pagina')).toBeInTheDocument();
		expect(screen.getByLabelText('Pagina anterior')).toBeInTheDocument();
		expect(screen.getByLabelText('Pagina siguiente')).toBeInTheDocument();
	});

	it('uses page label without page number buttons when showPages is not set', () => {
		render(TablePagination, {
			props: {
				total: 42,
				page: 2,
				limit: 10,
				pageLabel: 'Page 2'
			}
		});

		expect(screen.getByText('Page 2')).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument();
	});
});
