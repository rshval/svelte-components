import type { Meta, StoryObj } from '@storybook/sveltekit';
import { fn } from 'storybook/test';
import Component from '../components/input/uploader/ImagesUploader.svelte';

const meta = {
	title: 'Components/input/uploader/ImagesUploader',
	component: Component,
	tags: ['autodocs'],
	args: {
		assetsGet: '/api/assets',
		assetsPost: '/api/assets',
		pathPrefix: '',
		onerror: fn()
	}
} satisfies Meta<Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SuccessUpload: Story = {
	name: 'success upload',
	args: {
		accept: ['image/png', 'image/jpeg']
	}
};

export const UnsupportedFormat: Story = {
	name: 'unsupported format',
	args: {
		accept: ['image/png'],
		onerror: fn()
	}
};

export const ServerError: Story = {
	name: 'server error',
	args: {
		onerror: fn()
	}
};
