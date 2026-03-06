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
		layout: 'centered'
	}
};

export default preview;
