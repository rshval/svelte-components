import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/BreadCrumbs.svelte';

const items = [
	{ title: 'Home', href: '/' },
	{ title: 'Catalog', href: '/catalog' },
	{ title: 'Product card' }
];

const meta = {
	title: 'Components/BreadCrumbs',
	component: Component,
	tags: ['autodocs'],
	args: {
		list: items,
		seo: false
	}
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SeoMarkup: Story = {
	args: {
		seo: true
	}
};
