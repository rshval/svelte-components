import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import '@testing-library/jest-dom/vitest';

import Button from './Button.svelte';
import Badge from './Badge.svelte';
import Loader from './Loader.svelte';

describe('Button component', () => {
	it('renders a native button and forwards HTML attributes', () => {
		render(Button, {
			props: {
				type: 'submit',
				title: 'Save',
				disabled: true,
				'aria-label': 'save-form',
				class: 'custom-button'
			}
		});

		const button = screen.getByRole('button', { name: 'save-form' });
		expect(button).toHaveClass('btn', 'custom-button');
		expect(button).toHaveAttribute('type', 'submit');
		expect(button).toHaveAttribute('title', 'Save');
		expect(button).toBeDisabled();
	});
});

describe('Badge component', () => {
	it('renders with the base class and an optional custom class', () => {
		const { container } = render(Badge, {
			props: {
				class: 'badge-accent'
			}
		});

		const badge = container.querySelector('span');
		expect(badge).toBeInTheDocument();
		expect(badge).toHaveClass('badge', 'badge-accent');
	});
});

describe('Loader component', () => {
	it('renders overlay when shadow and absolute options are enabled', () => {
		const { container } = render(Loader, {
			props: {
				shadow: true,
				absolute: true,
				themeBg: true,
				class: 'loading-sm'
			}
		});

		const overlay = container.querySelector('.loader-shadow');
		const loader = container.querySelector('.loader');
		const spinner = container.querySelector('.loading-spinner');

		expect(overlay).toBeInTheDocument();
		expect(loader).toHaveClass('absolute', 'top-1/2', 'left-1/2');
		expect(spinner).toHaveClass('theme-bg-1', 'loading-sm');
	});
});
