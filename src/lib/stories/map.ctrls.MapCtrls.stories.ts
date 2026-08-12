import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from './MapMockDemo.svelte';

const meta = {
	title: 'Components/map/ctrls/MapCtrls',
	component: Component,
	tags: ['autodocs'],
	args: {
		variant: 'ctrls'
	}
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
