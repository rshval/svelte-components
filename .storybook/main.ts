import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(js|ts|svelte)'],
	addons: ['@storybook/addon-a11y'],
	framework: {
		name: '@storybook/sveltekit',
		options: {}
	},
	viteFinal: async (viteConfig) => {
		delete viteConfig.base;
		delete viteConfig.root;

		return viteConfig;
	},
	docs: {
		autodocs: 'tag'
	}
};

export default config;
