---
'@rshval/svelte-components': patch
---

fix(modal): migrate internals to snippet/render API for Svelte 5 build compatibility

- removed mixed `<slot>` + `{@render}` usage in `Modal.svelte` to prevent `slot_snippet_conflict`
- kept `children` / `buttons` snippet API and default actions fallback unchanged
- documented migration example from legacy slot syntax to snippet syntax in README
