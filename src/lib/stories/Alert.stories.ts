import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/Alert.svelte';

const meta = {
	title: 'Components/Alert',
	component: Component,
	tags: ['autodocs']
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
