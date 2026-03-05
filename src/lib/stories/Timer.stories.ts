import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/Timer.svelte';

const meta = {
	title: 'Components/Timer',
	component: Component,
	tags: ['autodocs'],
	args: {
		timer: 30,
		end: false
	}
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OneMinute: Story = {
	args: {
		timer: 60
	}
};
