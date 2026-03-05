import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/theme/Theme.svelte';

const meta = {
	title: 'Components/theme/Theme',
	component: Component,
	tags: ['autodocs']
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
