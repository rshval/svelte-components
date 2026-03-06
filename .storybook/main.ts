import type { StorybookConfig } from '@storybook/sveltekit';
import tailwindcss from '@tailwindcss/vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(js|ts|svelte)'],
	addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
	framework: {
		name: '@storybook/sveltekit',
		options: {}
	},
	viteFinal: async (viteConfig) => {
		delete viteConfig.base;
		delete viteConfig.root;

		return mergeConfig(viteConfig, {
			plugins: [tailwindcss()],
			resolve: {
				dedupe: ['svelte']
			},
			optimizeDeps: {
				include: ['svelte']
			}
		});
	},
	docs: {
		autodocs: 'tag'
	}
};

export default config;
