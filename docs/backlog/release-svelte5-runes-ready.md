# Release Task: Svelte 5 runes-ready API, Component Structure Standardization, and Migration Guide

## Summary
Prepare a release-focused improvement package for `svelte-components` that makes core UI APIs explicitly **Svelte 5 runes-ready**, standardizes component internal/public structure, and provides a safe migration path for consumers without breaking current minor compatibility.

## Goals
1. Ship runes-ready usage for `Input`, `Modal`, `Sheet`, `Tabs` in docs and playground.
2. Establish and document a unified bindable/readonly props contract.
3. Introduce snippet API usage (`{#snippet}` / `{@render}`) with legacy-slot compatibility and deprecation policy.
4. Define and apply a component structure standard to target components.
5. Publish migration notes and checklists for consumers.
6. Sync ecosystem dependencies (including `gislar`) when public contracts change.

## Scope

### 1) Runes-ready examples (`Input`, `Modal`, `Sheet`, `Tabs`)
- Add examples using runes primitives intentionally:
  - `$props()` for component input contracts.
  - `$state` only for local mutable state.
  - `$derived` for pure computed values.
  - `$effect` **only** for side-effects (with guard + cleanup where required).
- `Tabs`:
  - Provide **controlled** and **uncontrolled** examples.
  - Document expected behavior and source of truth in each mode.
- `Modal` and `Sheet`:
  - Cover opening/closing through bindable state.
  - Cover callback/API-triggered open/close flow.
- Explicitly avoid `$effect` for pure calculations.

### 2) Bindable props contract
- Lock and document a recommended public API pattern:
  - Use `$bindable` for consumer-managed mutable values.
  - Explicitly separate **bindable** props from **readonly** props in type contracts and docs.
- Add a decision matrix:
  - Section: **When to use bindable vs readonly**.
  - Include positive examples and anti-patterns.

### 3) Snippet API and legacy-slot compatibility
- Add snippet-based examples for:
  - Header/content/footer composition using `{#snippet}` + `{@render}`.
- Document compatibility mode:
  - How snippet API coexists with legacy slots during transition.
- Define deprecation policy:
  - Legacy slots are deprecated but remain supported in current minor release.
  - No breaking changes in this release line.

### 4) Component structure standard (mandatory)
- Publish a standard section describing canonical component layout:
  - `types`
  - `props contract`
  - `state`
  - `derived`
  - `effects`
  - `events/callbacks`
  - `snippets/slots`
  - `styles`
  - `exports`
- Define file organization:
  - `Component.svelte`
  - `Component.types.ts`
  - `index.ts`
  - `docs/examples/tests`
- Fix naming conventions and shared-logic placement rules.
- If no existing standard is in place:
  - Create it now.
  - Apply at minimum to `Input`, `Modal`, `Sheet`, `Tabs`.
  - Add migration notes for remaining components.

### 5) Consumer migration notes
Create a dedicated migration guide section with before/after examples:
- From legacy slots to snippets.
- From legacy props/events to runes-ready props contract.
- From ad-hoc component layout to standard component structure.
- Include a migration checklist with edge cases:
  - mixed controlled/uncontrolled usage,
  - stale callback references,
  - bindable defaults,
  - fallback rendering for legacy slots.

### 6) Ecosystem synchronization
- If public types/contracts change:
  - create follow-up PR/issue in `gislar`.
- Do not duplicate shared entities/contracts in consumers:
  - prefer shared packages/contracts.
- Update integration examples where relevant (`web/api/socket`) if contract changes affect those flows.

## Deliverables
- Updated docs with sections:
  1. `Svelte 5 runes-ready usage`
  2. `Component structure standard`
- Playground examples for all target components.
- Smoke examples confirming legacy-slot compatibility.
- Migration guide with before/after snippets.
- Applied structure standard on `Input`, `Modal`, `Sheet`, `Tabs`.
- Follow-up artifact for ecosystem sync (`gislar` issue/PR) when required.

## Acceptance Criteria
- All 4 target components have runes-ready examples in docs and playground.
- README/Docs include:
  1. `Svelte 5 runes-ready usage`
  2. `Component structure standard`
- Legacy-slot backward compatibility is preserved and validated by smoke examples.
- Migration guide is added with practical before/after examples.
- Repository contains explicit component structure standard doc (or README section).
- If standard was missing, it is created and applied to target components.

## Suggested Execution Plan (single release track)
1. **Documentation contract first**: define bindable/readonly + structure standard + deprecation policy.
2. **Component adaptation**: apply standardized structure and runes-ready API to 4 target components.
3. **Examples and playground**: controlled/uncontrolled and bindable/callback patterns.
4. **Migration guide and smoke coverage**: prove non-breaking behavior for legacy slots.
5. **Ecosystem sync**: open `gislar` follow-up issue/PR if public contracts changed.

## Risks and Guardrails
- Risk: accidental behavioral drift from uncontrolled to controlled mode.
  - Guardrail: preserve default uncontrolled semantics and document precedence rules.
- Risk: misuse of `$effect` for pure derivation.
  - Guardrail: enforce `$derived` for pure computations and review effects for side-effect-only intent.
- Risk: silent breaking changes in slot behavior.
  - Guardrail: keep legacy-slot runtime path and add smoke scenarios.

## Follow-up Prompt Template (`gislar`)
Use this prompt if shared contracts/public types were modified:

> Update `gislar` to align with latest `svelte-components` runes-ready contracts.
> Scope:
> 1) sync shared component types and bindable/readonly props contracts,
> 2) replace duplicated local entities with shared contracts,
> 3) validate integration paths (web/api/socket) against updated callbacks/events,
> 4) add migration notes for consumer modules that still rely on legacy slot/prop patterns.
> Acceptance:
> - no duplicated contract definitions,
> - passing integration smoke checks,
> - updated examples where API usage changed.

