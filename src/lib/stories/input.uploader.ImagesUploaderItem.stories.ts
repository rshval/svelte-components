import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/input/uploader/ImagesUploaderItem.svelte';

const meta = {
	title: 'Components/input/uploader/ImagesUploaderItem',
	component: Component,
	tags: ['autodocs']
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
