# @rshval/svelte-components

Reusable UI library for Svelte 5.

Package includes:

- base UI components (`Button`, `InputField`, `Select`, `Modal`, `Toast`, `Alert`);
- composite components (`Table`, `InputPhone`, `Drawer`, `Notifications`);
- map components built on `mapbox-gl`;
- helpers and plugins (`api`, `geoserviceApi`, `storage*`);
- ready-to-use Svelte stores for session, account, network, geolocation, and device info.

## Project positioning

This library is primarily developed and used by the author in personal projects.

What this means in practice:

- there is currently **no goal** to turn this package into a large universal UI library with a full standalone docs site in the near term;
- API, component set, and dependency list may evolve as real product needs change;
- the library is kept up to date for the author’s active projects and updated in a timely manner;
- improvements, fixes, and suggestions are welcome via Pull Request.

### About Storybook and examples

- Storybook in this repository is still incomplete and needs further work.
- For integration scenarios, prefer Svelte sandbox / a local SvelteKit sandbox.
- The README captures working patterns and should be used as the primary reference.

### Svelte Playground note

If you see `Failed to import $app@latest`, it means the example contains SvelteKit-only aliases (`$app/*`) but is opened in plain Svelte Playground.

Use one of these options:

- run the example in a SvelteKit project/sandbox;
- replace `$app/*` imports with environment-agnostic alternatives before running in plain Svelte Playground.

## Installation

```bash
npm i @rshval/svelte-components
```

Also make sure your project has compatible library dependencies installed:

- `@popperjs/core` — runtime dependency (installed automatically with the package);
- `svelte`, `@sveltejs/kit`, `@tiptap/*` — peer dependencies that must stay compatible in consumer apps.

## Quick README navigation

- [Project positioning](#project-positioning)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Component usage](#component-usage)
- [Exports](#exports)
- [Storybook](#storybook)

## Quick start

```svelte
<script lang="ts">
	import { Button, InputField, Table } from '@rshval/svelte-components';

	let value = $state('');
	const rows = [{ id: '1', name: 'Alice' }];
	const columns = [{ id: 'name', title: 'Name' }];
</script>

<InputField bind:value label="Name" placeholder="Enter name" />
<Button>Save</Button>
<Table {rows} {columns} />
```

## Component usage

Below are working patterns aligned with the current component implementations and exported API.

### Modal

Use-case: confirmations, forms, and content cards with user actions.

> For programmatic control (`showModal()` / `close()`), `bind:element` is required; otherwise consumers have no reference to the internal `dialog` element.

#### Props / Events / Bindings

| Type      | Fields |
| --- | --- |
| Props    | `title`, `noActions`, `btnDisabled`, `classBox`, `class`, `styleBox`, `noAutoClose`, `btnText` |
| Events   | `onclose` |
| Bindings | `bind:element`, `bind:send` |

#### Basic example

```svelte
<script lang="ts">
	import { Modal } from '@rshval/svelte-components';

	let modalElem: HTMLDialogElement | null = null;
</script>

<button class="btn" onclick={() => modalElem?.showModal()}>Open</button>

<Modal bind:element={modalElem} title="Title" noActions>
	<div class="p-4">Modal content</div>
</Modal>
```

#### Programmatic control (production-like)

```svelte
<script lang="ts">
	import { Modal, Button } from '@rshval/svelte-components';

	let modalElem: HTMLDialogElement | null = null;
</script>

<Button onclick={() => modalElem?.showModal()}>Open</Button>

<Modal bind:element={modalElem} title="Title" noActions btnDisabled classBox="max-w-xl">
	<div class="p-4">
		Modal content
		<div class="mt-4">
			<Button onclick={() => modalElem?.close()} class="btn-ghost">Close</Button>
		</div>
	</div>
</Modal>
```

### Toast

Use-case: quick notifications for successful/error actions.

#### Props / Events / Bindings

| Type      | Fields |
| --- | --- |
| Props    | `items`, `class` |
| Events   | `onclose(item)` |
| Bindings | none |

#### Input variants

1. **Current API**: `items` array.
2. **Legacy pattern**: `{ type, message }` object mapped to `items` in caller code.

#### Current example

```svelte
<script lang="ts">
	import { Toast } from '@rshval/svelte-components';

	let toast: { type: 'success' | 'info' | 'alert'; message: string } | null = {
		type: 'success',
		message: 'Saved'
	};
</script>

{#if toast}
	<Toast items={[toast]} onclose={() => (toast = null)} />
{/if}
```

#### Legacy-compatible example (`type + message`)

```svelte
<script lang="ts">
	import { Toast } from '@rshval/svelte-components';

	let toast: { type: 'success' | 'info' | 'alert'; message: string } | null = {
		type: 'info',
		message: 'Done'
	};
</script>

{#if toast}
	<Toast
		items={[{ type: toast.type, message: toast.message }]}
		onclose={() => (toast = null)}
	/>
{/if}
```

> `type` and `message` as standalone props are not supported by current `Toast`; for backward compatibility map them into `items`.

### Table stack: `TableFilters` + `Table` + `TablePagination`

Use-case: list pages (orders/events/customers) with filters and pagination.

#### Table

| Type      | Fields |
| --- | --- |
| Props    | `columns`, `rows`, `hover`, `zebra`, `class`, `selected`, `ths`, `trs` |
| Events   | none (row selection is done via `selected`) |
| Bindings | `bind:rows`, `bind:columns`, `bind:selected` |

#### TableFilters

| Type      | Fields |
| --- | --- |
| Props    | `title`, `count`, `bodyClass`, `class` |
| Events   | none |
| Snippets | `#snippet actions()` + children |

#### TablePagination

| Type      | Fields |
| --- | --- |
| Props    | `total`, `page`, `limit`, `limitOptions`, `onPrev`, `onNext`, `onLimitChange`, `canPrev`, `canNext`, `summary`, `pageLabel`, `showLimit`, `class` |
| Events   | callback props |
| Bindings | none |

#### End-to-end example

```svelte
<script lang="ts">
	import { Table, TableFilters, TablePagination, Button } from '@rshval/svelte-components';
	import ActionButtons from '$lib/components/ActionButtons.svelte';

	let rows: any[] = [];

	function openEdit(id: string) {
		console.log('edit', id);
	}

	function doDelete(id: string) {
		console.log('delete', id);
	}

	const columns = [
		{ id: 'id', title: 'ID', tpl: (r: any) => r._id },
		{ id: 'title', title: 'Title', tpl: (r: any) => r.title },
		{
			id: 'actions',
			title: '',
			component: ActionButtons,
			props: {
				onEdit: openEdit,
				onDelete: doDelete
			},
			propsFn: (r: object) => {
				return {
					row: r
				};
			}
		}
	];

	let total = 0;
	let pageNumber = 1;
	let limit = 10;

	function resetFilters() {
		pageNumber = 1;
		load();
	}

	function load() {
		// load rows/total
	}
</script>

<TableFilters title="Filters" count={rows.length} bodyClass="grid grid-cols-1 gap-3 md:grid-cols-4">
	{#snippet actions()}
		<Button class="btn-ghost btn-sm" onclick={resetFilters}>Reset</Button>
	{/snippet}

	<input class="input-bordered input input-sm" placeholder="Search" />
	<Button class="btn-sm btn-primary" onclick={load}>Apply</Button>
</TableFilters>

<Table {columns} {rows} hover class="table-sm" />

<TablePagination
	{total}
	page={pageNumber}
	{limit}
	limitOptions={[10, 20, 50]}
	onLimitChange={(value) => {
		pageNumber = 1;
		limit = value;
		load();
	}}
	onPrev={() => {
		pageNumber -= 1;
		load();
	}}
	onNext={() => {
		pageNumber += 1;
		load();
	}}
	canPrev={pageNumber > 1}
	canNext={pageNumber * limit < total}
/>
```

#### Example action-cell component (`ActionButtons.svelte`)

```svelte
<!-- Action component for table cell -->
<script lang="ts">
	import { Button } from '@rshval/svelte-components';
	import IconEdit from '@tabler/icons-svelte-runes/icons/edit';
	import IconTrash from '@tabler/icons-svelte-runes/icons/trash';

	let { onEdit, onDelete, row, propsFn } = $props();

	$effect(() => {
		console.log(propsFn, row);
	});

	function handleEdit() {
		onEdit(row._id);
	}

	function handleDelete() {
		onDelete(row._id);
	}
</script>

<div class="flex gap-2">
	<Button class="btn-sm" onclick={handleEdit}><IconEdit size={16} /></Button>
	<Button class="btn-sm btn-error" onclick={handleDelete}><IconTrash size={16} /></Button>
</div>
```

How it works:

- `props` from the column definition are passed as regular component inputs (`onEdit`, `onDelete`).
- `propsFn(row)` is executed for each row and adds dynamic inputs (for example, `row`).
- Inside the component, values are received via `let { ... } = $props()`.
- As a result, `ActionButtons` receives both callbacks and current row data, then can call `onEdit(row._id)` and `onDelete(row._id)`.

### Form components

#### InputField

Use-case: text inputs and password fields with toggle.

| Type      | Fields |
| --- | --- |
| Props    | `value`, `label`, `type`, `passwordToggle`, `class`, `id` + HTML attributes (`placeholder`, `autocomplete`, `name`, `spellcheck`, `maxlength` etc.) |
| Events   | `oninput`, `onchange`, `onfocus` |
| Bindings | `bind:value` |

```svelte
<InputField bind:value={title} placeholder="Title" />

<InputField
	value={smtpHostDraft}
	type="text"
	oninput={(e: any) => (smtpHostDraft = String(e.currentTarget?.value || ''))}
/>
```

#### InputPhone

Use-case: phone input with country selector.

| Type      | Fields |
| --- | --- |
| Props    | `value`, `inputId`, `inputClass`, `placeholder`, `disabledCountry`, `disabled`, `class` |
| Events   | `onInput` |
| Bindings | `bind:value`, `bind:country`, `bind:valid`, `bind:element` |

```svelte
<InputPhone
	inputId="buyer-phone"
	inputClass="input-bordered input w-full"
	bind:value={buyerPhone}
/>
```

#### Switch

Use-case: binary flags in filters/settings.

| Type      | Fields |
| --- | --- |
| Props    | `checked`, `styleType`, `class`, `disabled` |
| Events   | `onchange` |
| Bindings | `bind:checked` |

```svelte
<Switch styleType="warning" bind:checked={isPrivate} />

<Switch
	checked={telegramEnabledDraft}
	onchange={(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		telegramEnabledDraft = Boolean(e.currentTarget?.checked);
	}}
/>
```

#### Select

Use-case: selecting a value from options.

| Type      | Fields |
| --- | --- |
| Props    | `value`, `options: Array<{ value; label }>`, `label`, `placeholder`, `disabled`, `required`, `class` |
| Events   | via standard `<select>` `onchange` |
| Bindings | `bind:value` |

```svelte
<Select
	label="Event"
	bind:value={selectedEvent}
	options={events.map((e) => ({ value: e._id, label: e.title }))}
	placeholder="No event"
/>
```

### Other UI components

- `Button`, `BreadCrumbs`, `Loader`, `ImagesUploader`, `Editor`, `Popup`, `Alert`, `ThemeButton`, `Theme`.

Minimal examples:

```svelte
<Alert class="alert-info">Info message</Alert>
<Popup title="Hint">Popup text</Popup>
<ThemeButton />
```

### Stores / API / Utils / Directives (non-UI exports)

#### Stores

Exports: `sessionStore`, `accountStore`, `sessionIsInited`, `accountStoreInited`, `deviceInfoStore`, `networkStore`, `geolocationStore`, `geolocationIsInited`.

```ts
import {
	sessionStore,
	accountStore,
	sessionIsInited,
	accountStoreInited
} from '@rshval/svelte-components';

if (!$sessionIsInited) {
	await sessionStore.initSession();
}
if (!$accountStoreInited) {
	await accountStore.initAccount(API_BASE);
}
```

#### API client

Exports: `api.get/post/put/patch/del`.

```ts
import { api, sessionStore } from '@rshval/svelte-components';
import { get } from 'svelte/store';

const session = get(sessionStore);
const res = await api.get(`${API_BASE}/events`, session?.dc1_auth_key);
```

#### Storage helpers

Exports: `storageGet`, `storageSet`, `storageRemove` (typically stores a JSON string).

```ts
import { storageGet, storageSet, storageRemove } from '@rshval/svelte-components';

await storageSet('cart', JSON.stringify(items));
const saved = await storageGet('cart');
await storageRemove('cart');
```

#### Utils

Exports: `isObject`, `isValidEmail`, `patternPassword`.

```ts
import { isObject, isValidEmail, patternPassword } from '@rshval/svelte-components';
```

#### Directive

Export: `clickOutside`.

```svelte
<script lang="ts">
	import { clickOutside } from '@rshval/svelte-components';

	let isOpen = $state(true);
</script>

<div use:clickOutside={() => (isOpen = false)}>
	...
</div>
```


### Coverage of commonly used entities

**UI**

- `Modal`
- `Button`
- `BreadCrumbs`
- `Table`
- `TableFilters`
- `TablePagination`
- `InputField`
- `InputPhone`
- `Switch`
- `Select`
- `Toast`
- `Loader`
- `ImagesUploader`
- `Editor`
- `Popup`
- `Alert`
- `ThemeButton`
- `Theme`

**Non-UI**

- `api`
- `sessionStore`, `sessionIsInited`
- `accountStore`, `accountStoreInited`
- `storageGet`, `storageSet`, `storageRemove`
- `isObject`, `isValidEmail`, `patternPassword`
- `clickOutside`
- `deviceInfoStore`
- `networkStore`
- `geolocationStore`, `geolocationIsInited`

### Current vs legacy

- **Current**: APIs listed in the tables above (including `Modal` with `bind:element` and `Toast` with `items`).
- **Legacy/compatibility**: old patterns where toast is passed as `{ type, message }` should be mapped to `items` on the consumer side.

## Exports

Main export groups from `src/lib/index.ts`:

- Components: `Button`, `Badge`, `InputField`, `Textarea`, `Editor`, `Select`, `Loader`, `Modal`, `Switch`, `Alert`, `Popup`, `BreadCrumbs`, `Timer`, `Toast`;
- Complex components: `InputPhone`, `Notifications`, `Notification`, `Table`, `Theme`, `ThemeButton`, `Drawer`;
- Map: `Map`, `MapComponent`, `UiMap*`, `getGeolocation`, mapbox event types;
- Helpers: `clickOutside`, `blurOnEscape`, `isValid*`, `patternPassword`, `getColorByValue`, `isObject`;
- Plugins: `api`, `geoserviceApi`, `storageGet/storageSet/storageRemove`;
- Stores: `accountStore`, `sessionStore`, `networkStore`, `deviceInfoStore`, `geolocationStore`, `screenOrientationStore`, `noScrollAppStore`.

## Development scripts

```bash
npm run dev
npm run check
npm run lint
npm run test
npm run build
npm run storybook
npm run build-storybook
```

## Storybook

For isolated visual component checks:

```bash
npm run storybook
```

Build static Storybook:

```bash
npm run build-storybook
```

## Publishing

Build package:

```bash
npm run prepack
```

Manual publish:

```bash
npm publish --access public
```

Automated release via Changesets:

1. Add a changeset (`npm run changeset`) describing your changes.
2. On `main`, workflow creates/updates a release PR with versions and changelog.
3. After merging the release PR, the package is published automatically (`npm run release`).

## Compatibility

| Package                              | Recommended version |
| ----------------------------------- | -------------------- |
| `svelte` (peer)                     | `^5.53.7`            |
| `@sveltejs/kit` (peer)              | `^2.53.4`            |
| `@tiptap/core` and `@tiptap/*` (peer) | `^3.20.0`          |
| `@popperjs/core` (runtime)          | `^2.11.8`            |

## SSR limitations and notes

- Some components target browser-only environments (`mapbox-gl`, geolocation, Capacitor plugins) and should be used on client side only.
- For SSR SvelteKit pages, wrap browser-only components in `if (browser)` checks or load them in `onMount`.
- Map components require token setup and client-side initialization code.
- Capacitor plugins assume native environment access; in regular browsers API limitations and fallback behavior may apply.

## Breaking changes policy

- Any removal/change of a public export (`exports` or named root export) is a breaking change and requires a major bump.
- Changes to required component props and public store/helper API shape are also breaking changes.
- Consumers should pin major version (`^1.x`) and read changelog before upgrading.

Detailed step-by-step extraction plan is in `MIGRATION_TO_STANDALONE.md`.

## Migration checklist for extracting into a standalone repository

1. Extract package into a separate git repository preserving history (`git subtree split` or history filtering).
2. Configure CI checks on pull requests: `check`, `prepack`, `build-storybook`.
3. Enable changesets workflow for semver and changelog management.
4. Verify public API: keep `exports` contracts stable and do not remove them without a major bump.
5. Add a consumer smoke example (minimal SvelteKit app) that installs package from tarball.

## CI and smoke checks

Recommended CI checks before publishing:

```bash
npm run check
npm run prepack
npm run smoke:exports
npm run build-storybook
```

`smoke:exports` verifies that after `prepack`, all artifacts declared in `exports` are present in `dist/`.
