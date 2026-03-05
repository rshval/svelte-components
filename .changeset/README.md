# Changesets

Use changesets to track semver changes before publishing:

```bash
npm run changeset
npm run version:packages
npm run build
npm run release
```

- `changeset` — create a new markdown file with a version bump intent.
- `version:packages` — applies version bumps and updates changelog.
- `release` — publishes packages to npm.
