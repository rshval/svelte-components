import { describe, expect, it } from 'vitest';
import type { Component } from 'svelte';
import * as lib from './index.js';

const componentExports = [
	'Alert',
	'Badge',
	'BreadCrumbs',
	'Button',
	'Drawer',
	'Editor',
	'FileUploader',
	'ImagesUploader',
	'ImagesUploaderItem',
	'InputField',
	'InputPhone',
	'Loader',
	'Map',
	'MapComponent',
	'Modal',
	'Notification',
	'Notifications',
	'Popup',
	'Select',
	'Switch',
	'Table',
	'TableFilters',
	'TablePagination',
	'Textarea',
	'Theme',
	'ThemeButton',
	'Timer',
	'Toast',
	'UiMap',
	'UiMapCenterPoint',
	'UiMapPoint',
	'UiMapPointDetail',
	'UiMapUserPoint'
] as const;

type ComponentExportName = (typeof componentExports)[number];
type _AllExportsAreSvelteComponents = {
	[K in ComponentExportName]: (typeof lib)[K] extends Component<any> ? true : never;
};
const _allExportsAreSvelteComponents: _AllExportsAreSvelteComponents = Object.fromEntries(
	componentExports.map((name) => [name, true])
) as _AllExportsAreSvelteComponents;

describe('public API: components', () => {
	it('exports every declared component and keeps component typing', () => {
		expect.assertions(componentExports.length + 1);
		expect(_allExportsAreSvelteComponents).toBeDefined();

		for (const componentName of componentExports) {
			expect(lib[componentName]).toBeDefined();
		}
	});
});
