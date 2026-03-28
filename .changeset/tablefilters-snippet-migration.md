---
'@rshval/svelte-components': patch
---

fix(table-filters): migrate to snippet/render API only

- removed remaining `<slot>` markup from `TableFilters.svelte`
- kept `actions` and `children` snippet composition API intact
- documented migration from legacy `slot="actions"` syntax in README
