import type { Meta, StoryObj } from '@storybook/sveltekit';
import RealComponent from '../components/map/MapComponent.svelte';
import MockComponent from './MapMockDemo.svelte';

const meta = {
	title: 'Components/map/MapComponent',
	component: RealComponent,
	tags: ['autodocs'],
	args: {
		accessToken: '',
		mapStyle: {
			id: 'light',
			title: 'Light',
			value: 'mapbox/light-v11'
		},
		lat: 55.78,
		lng: 49.12,
		zoom: 12,
		maxZoom: 17
	}
} satisfies Meta<RealComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TokenRequired: Story = {
	render: () => ({
		Component: MockComponent,
		props: {
			variant: 'component'
		}
	})
};
