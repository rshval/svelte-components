---
'@rshval/svelte-components': patch
---

fix: align editor bubble menu options and socket spec typing

- replaced deprecated `tippyOptions` with `options` in `Editor` bubble menu config for current TipTap API
- fixed `create-socket-client.spec.ts` narrowing so websocket mock assertions are properly typed
