import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/Loader.svelte';

const meta = {
	title: 'Components/Loader',
	component: Component,
	tags: ['autodocs'],
	args: {
		class: 'loading-lg',
		shadow: false,
		absolute: false,
		themeBg: false
	}
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithShadow: Story = {
	args: {
		shadow: true
	}
};
