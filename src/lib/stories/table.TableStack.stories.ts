import type { Meta, StoryObj } from '@storybook/sveltekit';
import TableStack from '../components/table/TableStack.svelte';
import TableStackDemo from './TableStackDemo.svelte';

const meta = {
	title: 'Components/table/TableStack',
	component: TableStack,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'TableStack is a lightweight list/card shell for mobile representations of data-heavy tables. It does not infer cards from table columns: keep domain-specific row content in the row snippet and use Table separately for desktop/tablet layouts when a semantic table is still the right view.'
			}
		}
	},
	argTypes: {
		rows: {
			description: 'Rows rendered as list items. Row keys use `_id`, `id`, then row index fallback.'
		},
		loading: {
			description: 'Shows a compact status block with spinner and sets `aria-busy` on the region.'
		},
		emptyLabel: {
			description: 'Text shown when `rows` is empty and `loading` is false.'
		},
		loadingLabel: {
			description: 'Text shown in the loading status.'
		},
		ariaLabel: {
			description: 'Accessible name for the list region.'
		},
		class: {
			description: 'Optional class for the outer stack section.'
		},
		listClass: {
			description: 'Optional class for the inner `ul` list.'
		},
		itemClass: {
			description: 'Optional class applied to every list item card.'
		},
		row: {
			description: 'Snippet rendered for each row: `row(item, index)`.'
		}
	}
} satisfies Meta<TableStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UsageWithFiltersAndPagination: StoryObj<typeof TableStackDemo> = {
	render: () => ({
		Component: TableStackDemo
	}),
	parameters: {
		docs: {
			description: {
				story:
					'Recommended composition: filters and pagination stay outside TableStack, while the row snippet owns product-specific layout, badges, metrics, and actions.'
			}
		}
	}
};

export const Basic: Story = {
	args: {
		rows: [
			{ id: '1', title: 'Apple juice' },
			{ id: '2', title: 'Orange marmalade' }
		],
		ariaLabel: 'Products',
		emptyLabel: 'No products found.'
	},
	parameters: {
		docs: {
			description: {
				story:
					'Basic fallback rendering is intentionally minimal. Production usage should normally provide a row snippet with the domain fields and actions that matter on mobile.'
			}
		}
	}
};

export const Loading: Story = {
	args: {
		rows: [],
		loading: true,
		ariaLabel: 'Products',
		loadingLabel: 'Loading products...'
	}
};

export const Empty: Story = {
	args: {
		rows: [],
		ariaLabel: 'Products',
		emptyLabel: 'No products found.'
	}
};
