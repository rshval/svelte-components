# @rshval/svelte-components

Reusable UI library for Svelte 5.

Package includes:

- base UI components (`Button`, `InputField`, `Select`, `Modal`, `Toast`, `Alert`);
- composite components (`Table`, `TableStack`, `InputPhone`, `Drawer`, `Notifications`, `SwipeNavigation`);
- map components built on `mapbox-gl`;
- helpers and plugins (`api`, `geoserviceApi`, `storage*`, `createApiClient`, `createSocketClient`, `createSocketIoConnectionConfig`);
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

Even with the newest Svelte version selected in Playground, `$app/*` remains unavailable there because it is provided by **SvelteKit runtime**, not by the core `svelte` package.

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
- `html-to-image` and `svelte-gestures` — runtime dependencies used by `SwipeNavigation`.

### Styling requirements (Tailwind + DaisyUI)

This library currently relies on utility and component classes from **Tailwind CSS 4** and **DaisyUI 5** (for example `btn`, `btn-primary`, `input`, `drawer`, `modal`).

If your app does not include these plugins, components will still render, but visual styles will be incomplete.

Minimum setup in consumer app styles:

```css
@import 'tailwindcss';
@plugin 'daisyui';
```

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

| Type     | Fields                                                                                         |
| -------- | ---------------------------------------------------------------------------------------------- |
| Props    | `title`, `noActions`, `btnDisabled`, `classBox`, `class`, `styleBox`, `noAutoClose`, `btnText` |
| Events   | `onclose`                                                                                      |
| Bindings | `bind:element`, `bind:send`, `bind:opened`                                                     |
| Snippets | `children`, `buttons`                                                                          |

#### Bindable vs readonly contract

For `Modal`, use a strict split:

- **Bindable**: `element`, `send`, `opened` (consumer can bind/manage mutable state and callbacks).
- **Readonly**: `title`, `btnText`, `noActions`, `noAutoClose`, `class`, `classBox`, `styleBox`, `children`, `buttons`.

Decision matrix:

| Scenario                                       | Use bindable   | Use readonly                 |
| ---------------------------------------------- | -------------- | ---------------------------- |
| Parent needs to call `showModal()` / `close()` | `bind:element` | `title`, content snippets    |
| Parent replaces submit handler dynamically     | `bind:send`    | static labels and styles     |
| Parent controls open/close via state           | `bind:opened`  | title/content/action styling |
| Static informational modal                     | no             | readonly props only          |

Compatibility note: if `opened` is not bound, `Modal` keeps legacy behavior and does not force-close dialog instances opened through `bind:element` + `showModal()`.

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

#### Bindable open state (controlled)

```svelte
<script lang="ts">
	import { Modal, Button } from '@rshval/svelte-components';

	let modalElem: HTMLDialogElement | null = null;
	let opened = $state(false);
</script>

<Button onclick={() => (opened = true)}>Open</Button>

<Modal bind:element={modalElem} bind:opened title="Controlled modal" noActions>
	<div class="p-4">
		Controlled from parent state.
		<div class="mt-4">
			<Button class="btn-ghost" onclick={() => (opened = false)}>Close</Button>
		</div>
	</div>
</Modal>
```

#### Runes-ready snippet API (recommended)

```svelte
<Modal bind:element={modalElem} title="Snippet modal">
	{#snippet children()}
		<div class="p-4">Snippet content</div>
	{/snippet}

	{#snippet buttons()}
		<button class="btn btn-primary" onclick={() => modalElem?.close()}>Confirm</button>
	{/snippet}
</Modal>
```

#### Migration from legacy slots to snippets

```svelte
<!-- Before (legacy slot syntax) -->
<Modal bind:element={modalElem} title="Legacy modal example">
	<div>Legacy content</div>
	<button slot="buttons" class="btn btn-primary">Legacy action</button>
</Modal>

<!-- After (snippet/render API) -->
<Modal bind:element={modalElem} title="Snippet modal example">
	{#snippet children()}
		<div>Legacy content</div>
	{/snippet}

	{#snippet buttons()}
		<button class="btn btn-primary">Legacy action</button>
	{/snippet}
</Modal>
```

`Modal` internals are now fully snippet/render based (Svelte 5 safe). Existing usage where content is passed between component tags remains compatible, but new code should use `children` and `buttons` snippets explicitly.

### Toast

Use-case: quick notifications for successful/error actions.

#### Props / Events / Bindings

| Type     | Fields                      |
| -------- | --------------------------- |
| Props    | `items`, `timeout`, `class` |
| Events   | `onclose(item)`             |
| Bindings | none                        |

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
	<Toast items={[toast]} timeout={3000} onclose={() => (toast = null)} />
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
	<Toast items={[{ type: toast.type, message: toast.message }]} onclose={() => (toast = null)} />
{/if}
```

> `type` and `message` as standalone props are not supported by current `Toast`; for backward compatibility map them into `items`.

### Table stack: `TableFilters` + `Table` + `TablePagination`

Use-case: list pages (orders/events/customers) with filters and pagination.

#### Table

| Type     | Fields                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Props    | `columns`, `rows`, `hover`, `zebra`, `class`, `selected`, `ths`, `trs`, `sortBy`, `sortDirection`, `manualSort`, `onSortChange` |
| Events   | none (row selection is done via `selected`)                                                                                     |
| Bindings | `bind:rows`, `bind:columns`, `bind:selected`                                                                                    |

Sortable columns are opt-in: set `sortable: true` on a column. Optional column fields:
`sortType: 'string' | 'number' | 'date'` and `align: 'left' | 'right'`.

#### TableFilters

| Type     | Fields                                           |
| -------- | ------------------------------------------------ |
| Props    | `title`, `count`, `bodyClass`, `class`, `framed` |
| Events   | none                                             |
| Snippets | `#snippet actions()` + children                  |

Readonly props contract: `TableFiltersProps`.

#### TablePagination

| Type     | Fields                                                                                                                                                                                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Props    | `total`, `page`, `limit`, `limitOptions`, `onPrev`, `onNext`, `onPageChange`, `onLimitChange`, `canPrev`, `canNext`, `summary`, `pageLabel`, `rangeSeparator`, `rowsPerPageLabel`, `previousLabel`, `nextLabel`, `paginationLabel`, `showLimit`, `showPages`, `class` |
| Events   | callback props                                                                                                                                                                                                                                                        |
| Bindings | none                                                                                                                                                                                                                                                                  |

Use `onPageChange` as the primary pagination callback when page numbers are visible. `onPrev` and
`onNext` remain supported for legacy prev/next-only pagination. If `pageLabel` is passed and
`showPages` is not set, page number buttons are hidden to preserve the old compact label layout.

#### TableStack

Use-case: mobile/card representation for data-heavy tables where horizontal scrolling would hide important row actions.

`TableStack` is intentionally a small shell, not an automatic table-to-card converter. Keep domain-specific content in the row snippet and use `Table` separately for desktop/tablet layouts when a real table is still the best view.

| Type     | Fields                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------- |
| Props    | `rows`, `loading`, `emptyLabel`, `loadingLabel`, `ariaLabel`, `class`, `listClass`, `itemClass` |
| Events   | none                                                                                            |
| Bindings | none                                                                                            |
| Snippets | `row(item, index)`                                                                              |

```svelte
<script lang="ts">
	import { TableStack } from '@rshval/svelte-components';

	const rows = [{ id: '1', title: 'Product', stock: 12, price: '$4.50' }];
</script>

<TableStack {rows} ariaLabel="Products" emptyLabel="No products found.">
	{#snippet row(item)}
		<div class="grid gap-2">
			<div class="font-semibold">{item.title}</div>
			<div class="text-sm text-base-content/70">Stock: {item.stock}</div>
			<div class="text-sm font-medium">{item.price}</div>
		</div>
	{/snippet}
</TableStack>
```

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
	<Button class="btn-primary btn-sm" onclick={load}>Apply</Button>
</TableFilters>

<Table {columns} {rows} hover class="table-sm" />

<TablePagination
	{total}
	page={pageNumber}
	{limit}
	limitOptions={[10, 20, 50]}
	onPageChange={(value) => {
		pageNumber = value;
		load();
	}}
	onLimitChange={(value) => {
		pageNumber = 1;
		limit = value;
		load();
	}}
/>
```

For localized pagination copy, override the small text props:

```svelte
<TablePagination
	total={42}
	page={2}
	limit={10}
	rangeSeparator="de"
	rowsPerPageLabel="Filas por pagina"
	previousLabel="Pagina anterior"
	nextLabel="Pagina siguiente"
	paginationLabel="Paginacion de tabla"
/>
```

#### Migration from legacy slots to snippets

```svelte
<!-- Before -->
<TableFilters title="Filters">
	<Button slot="actions" class="btn-ghost btn-sm" onclick={resetFilters}>Reset</Button>

	<input class="input-bordered input input-sm" placeholder="Search" />
	<Button class="btn-primary btn-sm" onclick={load}>Apply</Button>
</TableFilters>

<!-- After -->
<TableFilters title="Filters">
	{#snippet actions()}
		<Button class="btn-ghost btn-sm" onclick={resetFilters}>Reset</Button>
	{/snippet}

	<input class="input-bordered input input-sm" placeholder="Search" />
	<Button class="btn-primary btn-sm" onclick={load}>Apply</Button>
</TableFilters>
```

`TableFilters` internals are snippet/render-only in current releases. Legacy slot syntax can still be migrated gradually, but snippet syntax is the recommended target.

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
	<Button class="btn-error btn-sm" onclick={handleDelete}><IconTrash size={16} /></Button>
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

| Type     | Fields                                                                                                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Props    | `value`, `label`, `type`, `passwordToggle`, `class`, `id`, callback props (`oninput`, `onchange`, `onfocus`, `onblur`, `onkeydown`) + native input attributes (`placeholder`, `autocomplete`, `name`, `spellcheck`, `maxlength` etc.) |
| Events   | callback props only                                                                                                                                                                                                                   |
| Bindings | `bind:value`                                                                                                                                                                                                                          |

Bindable vs readonly split:

- **Bindable**: `value`.
- **Readonly**: `label`, `type`, `passwordToggle`, `class`, `id` and other native input attributes.

Compatibility note: use callback props such as `oninput={...}` and `onkeydown={...}`. `InputField` does not expose a custom dispatcher API.

```svelte
<InputField bind:value={title} placeholder="Title" />

<InputField
	value={smtpHostDraft}
	type="text"
	oninput={(e: any) => (smtpHostDraft = String(e.currentTarget?.value || ''))}
	onkeydown={(e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			console.log('submit');
		}
	}}
/>
```

#### InputPhone

Use-case: phone input with country selector.

| Type     | Fields                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------- |
| Props    | `value`, `inputId`, `inputClass`, `placeholder`, `disabledCountry`, `disabled`, `class`, `onInput` |
| Events   | callback props only                                                                                |
| Bindings | `bind:value`, `bind:country`, `bind:valid`, `bind:element`, `bind:detailedValue`, `bind:options`   |

`bind:valid` is optional. If the parent does not need validation state, `InputPhone` can be used with only `bind:value`.

```svelte
<InputPhone
	inputId="buyer-phone"
	inputClass="input-bordered input w-full"
	placeholder="+7 (XXX) XXX-XX-XX"
	bind:value={buyerPhone}
/>
```

#### Switch

Use-case: binary flags in filters/settings.

| Type     | Fields                                      |
| -------- | ------------------------------------------- |
| Props    | `checked`, `styleType`, `class`, `disabled` |
| Events   | `onchange`                                  |
| Bindings | `bind:checked`                              |

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

| Type     | Fields                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------- |
| Props    | `value`, `options: Array<{ value; label }>`, `label`, `placeholder`, `disabled`, `required`, `class` |
| Events   | via standard `<select>` `onchange`                                                                   |
| Bindings | `bind:value`                                                                                         |

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

### SwipeNavigation

Use-case: app-like forward/back transitions for SvelteKit route screens, including swipe-back and a context-aware back button.

`SwipeNavigation` is router-driven: wrap route content in the component and use `appGoto()` for forward navigation. `BackButton` must be rendered inside `SwipeNavigation`; it reads the navigation context and is a no-op when there is no captured back entry.

| Type     | Fields                                           |
| -------- | ------------------------------------------------ |
| Props    | `enabled`, `isRouteEnabled`, `navigate`          |
| Bindings | none                                             |
| Helpers  | `appGoto`, `registerAppNavigator`                |
| Context  | `SWIPE_NAVIGATION_CONTEXT`, `SwipeNavigationApi` |

#### SvelteKit layout example

```svelte
<script lang="ts">
	import { page } from '$app/state';
	import { SwipeNavigation } from '@rshval/svelte-components';

	let { children } = $props();

	const swipeRoutes = ['/', '/catalog', '/product', '/shop'];

	function isSwipeRoute(pathname: string) {
		if (pathname === '/') return true;

		return swipeRoutes
			.filter((route) => route !== '/')
			.some((route) => pathname === route || pathname.startsWith(`${route}/`));
	}

	const swipeEnabled = $derived(isSwipeRoute(page.url.pathname));
</script>

<SwipeNavigation enabled={swipeEnabled} isRouteEnabled={isSwipeRoute}>
	{@render children()}
</SwipeNavigation>
```

#### Route navigation and back button

```svelte
<script lang="ts">
	import { appGoto, BackButton } from '@rshval/svelte-components';

	async function openProduct(id: string) {
		await appGoto(`/product/${id}`);
	}
</script>

<button type="button" class="btn btn-primary" onclick={() => openProduct('42')}>
	Open product
</button>

<BackButton text="Back" class="btn btn-ghost" />
```

For non-default router adapters, pass `navigate={(url) => router.push(url)}` to `SwipeNavigation`.

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

<div use:clickOutside={() => (isOpen = false)}>...</div>
```

### Coverage of commonly used entities

**UI**

- `Modal`
- `Button`
- `BreadCrumbs`
- `Table`
- `TableStack`
- `TableFilters`
- `TablePagination`
- `InputField`
- `InputPhone`
- `SwipeNavigation`
- `BackButton`
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
- Complex components: `InputPhone`, `Notifications`, `Notification`, `Table`, `TableStack`, `Theme`, `ThemeButton`, `Drawer`, `SwipeNavigation`, `BackButton`;
- Navigation helpers: `appGoto`, `registerAppNavigator`, `SWIPE_NAVIGATION_CONTEXT`, `SwipeNavigationApi`;
- Map: `Map`, `MapComponent`, `UiMap*`, `getGeolocation`, mapbox event types;
- Helpers: `clickOutside`, `blurOnEscape`, `isValid*`, `patternPassword`, `getColorByValue`, `isObject`;
- Plugins: `api`, `geoserviceApi`, `storageGet/storageSet/storageRemove`;
- Network transport package: `createApiClient`, `createSocketClient`, `createSocketIoConnectionConfig` and typed event/env helpers from `@rshval/svelte-components/network` (also re-exported from root package);
- Stores: `accountStore`, `sessionStore`, `networkStore`, `deviceInfoStore`, `geolocationStore`, `screenOrientationStore`, `noScrollAppStore`.

### `@rshval/svelte-components/network`

Lightweight transport primitives without product/business logic:

- `createApiClient` — fetch-based HTTP client with typed responses and optional auth token resolver.
- `createSocketClient` — typed websocket client with strongly typed inbound/outbound events.
- `createSocketIoConnectionConfig` — env adapter for Socket.IO web client connection config (`withCredentials`, `transports`).
- env-driven config via `baseUrlEnvKey` / `urlEnvKey` (`import.meta.env`, `process.env`, or explicit `env` object).

```ts
import {
	createApiClient,
	createSocketClient,
	createSocketIoConnectionConfig
} from '@rshval/svelte-components/network';

const api = createApiClient({
	baseUrlEnvKey: 'PUBLIC_API_URL'
});

const socketIoConfig = createSocketIoConnectionConfig(import.meta.env, {
	isProduction: import.meta.env.PROD
});

// Example with socket.io-client:
// io(import.meta.env.VITE_SOCKET_URL, socketIoConfig);

type IncomingEvents = {
	chat_message: { id: string; text: string };
};

type OutgoingEvents = {
	send_message: { text: string };
};

const socket = createSocketClient<IncomingEvents, OutgoingEvents>({
	urlEnvKey: 'PUBLIC_WS_URL'
});
```

`VITE_SOCKET_WITH_CREDENTIALS` accepts boolean-like values (`true/false/1/0/on/off/yes/no`).
`VITE_SOCKET_TRANSPORTS` accepts a comma-separated list with validated values: `websocket`, `polling`, `webtransport`.

```ts
import { createSocketIoConnectionConfig } from '@rshval/svelte-components/network/socket-io';

const config = createSocketIoConnectionConfig(import.meta.env, {
	isProduction: import.meta.env.PROD
});
```

## ImagesUploader

`ImagesUploader` now validates files on the client before upload starts.

- Default supported formats: `image/png`, `image/jpeg` (`.png`, `.jpg`, `.jpeg`).
- Invalid files are rejected before preview/upload.
- Upload errors are returned through `onerror`.
- `FormData` uploads are sent as real `multipart/form-data`; when `multiple` is enabled, uploader requests keep all selected files in a single multipart payload.

### Props

- `accept?: string | string[]` - accepted file formats (default: `['image/png', 'image/jpeg']`).
- `maxFileSizeMb?: number` - optional max file size in MB.
- `validateFile?: (file: File) => string | null` - custom validator, returns error text or `null`.
- `onerror?: (message: string, context?: { fileName?: string; code?: string }) => void` - unified error callback for client/server upload errors.

### Toast integration example

```svelte
<script lang="ts">
	import { ImagesUploader, Toast } from '@rshval/svelte-components';

	let toastItems = $state([]);

	function handleUploadError(message: string, context?: { fileName?: string }) {
		toastItems = [
			...toastItems,
			{
				type: 'alert',
				message: context?.fileName ? `${context.fileName}: ${message}` : message
			}
		];
	}
</script>

<ImagesUploader
	assetsGet="/api/assets"
	assetsPost="/api/assets"
	pathPrefix=""
	onerror={handleUploadError}
/>

<Toast items={toastItems} timeout={3000} />
```

## Development scripts

```bash
npm run dev
npm run check
npm run lint
npm run test
npm run test:browser
npm run build
npm run storybook
npm run build-storybook
```

`npm run test` runs the Node/server Vitest suite by default.

`npm run test:browser` runs browser-based Svelte tests and requires Playwright Chromium installed locally:

```bash
pnpm exec playwright install
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

| Package                                        | Recommended version |
| ---------------------------------------------- | ------------------- |
| `svelte` (peer)                                | `^5.53.7`           |
| `@sveltejs/kit` (optional, for SvelteKit apps) | `^2.53.4`           |
| `@tiptap/core` and `@tiptap/*` (peer)          | `^3.20.0`           |
| `@popperjs/core` (runtime)                     | `^2.11.8`           |

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

### QR scanner (event check-in, Web + Capacitor)

`QrScanner` gives a unified scanner API for browser and Capacitor apps.

- **Web mode**: uses native `BarcodeDetector`, and falls back to `@zxing/browser`.
- **Capacitor mode**: uses `@capacitor-mlkit/barcode-scanning` if installed.
- Built-in dedupe (`cooldownMs`) prevents duplicate check-in actions for repeated scans.
- Deep-link parser supports payload like `/board/tickets/scanner?ticket=...`.
- Visual scan feedback: green frame + check icon for success, red frame + cross icon for invalid scan.

```svelte
<script lang="ts">
	import { QrScanner, type ParsedQrPayload } from '@rshval/svelte-components';

	type TicketStatus = 'idle' | 'loading' | 'valid' | 'used' | 'invalid';

	let scannerRef: { pause: () => void; resume: () => void } | null = null;
	let ticketNumber = '';
	let status: TicketStatus = 'idle';
	let message = 'Scan ticket QR to begin check-in';

	async function loadTicketStatus(scanned: ParsedQrPayload) {
		if (!scanned.ticketNumber) {
			status = 'invalid';
			message = 'QR does not contain a check-in ticket number';
			return;
		}

		ticketNumber = scanned.ticketNumber;
		status = 'loading';
		scannerRef?.pause();

		const result = await fetch(`/api/tickets/status?ticket=${ticketNumber}`).then((r) => r.json());
		status = result.status;
		message = result.message;
	}

	async function activateTicket() {
		await fetch('/api/tickets/activate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ticketNumber })
		});

		status = 'used';
		message = `Ticket ${ticketNumber} is activated`;
		scannerRef?.resume();
	}
</script>

<QrScanner
	bind:this={scannerRef}
	formats={['qr_code']}
	cooldownMs={2500}
	highlightFrame
	showScanResult
	scanResultDurationMs={1400}
	isSuccessfulScan={(payload) => payload.kind === 'check-in-link' && Boolean(payload.ticketNumber)}
	vibrateOnDetect
	onDetect={loadTicketStatus}
	onError={(error) => (message = error.message)}
/>

<p>{message}</p>

{#if status === 'valid'}
	<button class="btn btn-success" onclick={activateTicket}>Activate ticket</button>
{/if}
```

If you need lower-level control, use `createQrScanner()` directly:

```ts
import { createQrScanner } from '@rshval/svelte-components';

const scanner = createQrScanner({
	cooldownMs: 2000,
	formats: ['qr_code'],
	onDetect: (payload) => console.log(payload.ticketNumber)
});

await scanner.start();
```

`QrScanner` visual feedback props:

- `showScanResult` (`true` by default) — show status icon in the center after each detection.
- `scanResultDurationMs` (`1400` by default) — how long success/error state is displayed.
- `isSuccessfulScan` — custom predicate to mark a payload as successful; if returns `false`, error state is shown.
