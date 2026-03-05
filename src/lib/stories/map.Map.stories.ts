import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/map/Map.svelte';

const meta = {
	title: 'Components/map/Map',
	component: Component,
	tags: ['autodocs']
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
