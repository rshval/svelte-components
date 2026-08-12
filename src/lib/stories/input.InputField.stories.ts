import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from './InputFieldDemo.svelte';

const meta = {
	title: 'Components/input/InputField',
	component: Component,
	tags: ['autodocs']
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
