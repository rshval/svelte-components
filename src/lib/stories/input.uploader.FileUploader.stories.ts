import type { Meta, StoryObj } from '@storybook/sveltekit';
import Component from '../components/input/uploader/FileUploader.svelte';

const meta = {
	title: 'Components/input/uploader/FileUploader',
	component: Component,
	tags: ['autodocs']
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
