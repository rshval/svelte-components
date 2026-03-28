# Changelog

All notable changes to this project are documented in this file.

## 1.3.4 - 2026-03-28

### Fixed

- Updated `Editor` bubble menu config to use `options` (current TipTap API) instead of deprecated `tippyOptions`.
- Fixed TypeScript narrowing in `create-socket-client.spec.ts` for websocket mock assertions.

## 1.3.3 - 2026-03-28

### Fixed

- Migrated `TableFilters` internals to snippet/render API only by removing remaining `<slot>` usage.
- Kept the same public composition contract (`actions` and `children` snippets) to avoid breaking existing usage.

### Docs

- Updated `README` `TableFilters` section and added migration example from legacy `slot="actions"` syntax to snippets.

## 1.3.2 - 2026-03-28

### Fixed

- Migrated `Modal` internals to Svelte 5 snippet/render API only, removing mixed `<slot>` + `{@render}` markup that caused `slot_snippet_conflict` during build.
- Preserved public `Modal` API (`children`, `buttons`, bindable props/events) and default action-button fallback behavior.

### Docs

- Updated `README` `Modal` section with snippet-first guidance and a migration example from legacy slot syntax to snippet syntax.
