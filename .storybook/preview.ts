import type { Preview } from '@storybook/sveltekit';
import './preview.css';

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},
		actions: { argTypesRegex: '^on[A-Z].*' },
		layout: 'fullscreen'
	},
	globalTypes: {
		appearance: {
			name: 'Mode',
			description: 'Quick switch between light and dark styles',
			defaultValue: 'theme',
			toolbar: {
				icon: 'mirror',
				dynamicTitle: true,
				items: [
					{ value: 'theme', title: 'Use selected theme' },
					{ value: 'light', title: 'Light' },
					{ value: 'dark', title: 'Dark' }
				]
			}
		},
		theme: {
			name: 'Theme',
			description: 'DaisyUI theme for component preview',
			defaultValue: 'bumblebee',
			toolbar: {
				icon: 'paintbrush',
				dynamicTitle: true,
				items: [
					{ value: 'bumblebee', title: 'Bumblebee' },
					{ value: 'light', title: 'Light' },
					{ value: 'dark', title: 'Dark' },
					{ value: 'cupcake', title: 'Cupcake' },
					{ value: 'corporate', title: 'Corporate' },
					{ value: 'night', title: 'Night' }
				]
			}
		}
	},
	decorators: [
		(Story, context) => {
			if (typeof document !== 'undefined') {
				const appearance = String(context.globals.appearance ?? 'theme');
				const selectedTheme = String(context.globals.theme ?? 'bumblebee');
				const activeTheme = appearance === 'theme' ? selectedTheme : appearance;
				document.documentElement.setAttribute('data-theme', activeTheme);
				document.body.classList.add('sb-daisy-preview');
			}

			return Story();
		}
	]
};

export default preview;
