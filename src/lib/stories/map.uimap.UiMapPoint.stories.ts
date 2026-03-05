import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/map/uimap/UiMapPoint.svelte';

const meta = {
	title: 'Components/map/uimap/UiMapPoint',
	component: Component,
	tags: ['autodocs']
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
