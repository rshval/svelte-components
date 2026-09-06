import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from './SwipeNavigationDemo.svelte';

const meta = {
	title: 'Components/swipeNavigation/SwipeNavigation',
	component: Component,
	tags: ['autodocs']
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RouterIntegration: Story = {};
