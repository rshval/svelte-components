import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from './MapMockDemo.svelte';

const meta = {
	title: 'Components/map/ctrls/MapCtrlScale',
	component: Component,
	tags: ['autodocs'],
	args: {
		variant: 'scale'
	}
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
