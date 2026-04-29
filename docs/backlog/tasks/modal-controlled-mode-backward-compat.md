# Backlog Task: Modal controlled mode backward compatibility

## Status

Done (2026-03-28)

## Context

From `release-svelte5-runes-ready.md`:

- preserve migration-safe behavior and avoid breaking existing consumers during transition.

## Scope delivered

- Updated `Modal` controlled `opened` sync to run only when `opened` is explicitly bound (controlled mode).
- Preserved legacy programmatic open flow (`bind:element` + `showModal()`) when `opened` is not provided.
- Added regression test to prevent accidental auto-close in uncontrolled mode.
- Updated README with explicit compatibility note for dependent repositories before migration.

## Notes for ecosystem sync

No immediate migration required in dependent repositories. They can continue legacy modal control and adopt `bind:opened` gradually.
