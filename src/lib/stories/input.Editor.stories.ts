import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/input/Editor.svelte';

const meta = {
	title: 'Components/input/Editor',
	component: Component,
	tags: ['autodocs'],
	args: {
		value:
			'<h2>Release notes</h2><p>Select text to see the bubble menu.</p><ul><li>Toolbar state</li><li>Inline formatting</li></ul>'
	}
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
	args: {
		value: ''
	}
};

export const Disabled: Story = {
	args: {
		disabled: true,
		value: '<p>This editor is rendered in disabled mode.</p>'
	}
};
