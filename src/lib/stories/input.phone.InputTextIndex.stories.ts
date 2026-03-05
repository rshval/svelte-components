import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/input/phone/InputTextIndex.svelte';

const meta = {
	title: 'Components/input/phone/InputTextIndex',
	component: Component,
	tags: ['autodocs']
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
