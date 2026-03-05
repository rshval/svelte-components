import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/input/phone/InputPhone.svelte';

const meta = {
	title: 'Components/input/phone/InputPhone',
	component: Component,
	tags: ['autodocs']
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
