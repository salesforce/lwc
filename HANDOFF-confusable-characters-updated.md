# Confusable Characters Transformation — Handoff

## Status

**Branch:** `wjh-ai/confusable-characters` (base: `master`)

**Verified state:** 313 source files transformed across 23 `@lwc` packages. All three
acceptance gates pass with exit code 0:

- `yarn build` — all 21 build projects succeed.
- `yarn test` — vitest: 77 files, 2817 passed, 10 skipped, exit 0. (The "2 failed
  snapshots / 2 expected fail" line is identical on clean `master` — pre-existing baseline
  behavior, not introduced by the transform. Verified by running the suite in a fresh
  `master` worktree.)
- `yarn test:wtr` — `@lwc/integration-wtr` across Chromium/Firefox/WebKit: 3496 passed per
  browser, 0 failed, exit 0.

**Goal:** Replace ASCII identifiers in LWC source with visually-similar Unicode "confusable"
characters while preserving every public API and keeping the build and test suites green.

## Scope

Transformed: identifiers in `.ts` (257 files) and non-test `.js` (56 files) under
`packages/@lwc/*/src`.

Excluded: `dist`, `__tests__`, `__mocks__`, `fixtures`, `*.snap`, `*.spec.*`, `*.test.*`,
`*.d.ts`, and any `.js`/`.ts` with a colocated `.html` (LWC component templates bind member
names by string, so a component's class surface is preserve-only). `.html`/`.css` are never
rewritten.

## How it works

The transformer is **binding-driven**, not occurrence-driven. This is the core design choice
that makes it correct: a single classification per binding guarantees a declaration and all
its references either all rename or none do, eliminating the declaration/reference divergence
that plagued the earlier occurrence-based approach.

### `scripts/confusables/`

- `transform.mjs` — orchestrator. Globs `packages/@lwc/*/src/**/*.{ts,js,mjs,cjs}` with the
  exclusions above, parses per-extension (TypeScript plugin only for `.ts`), transforms,
  runs `yarn format`, and (with `--verify`) gates on build/test/test:wtr with optional
  `--checkpoint=<ref>` rollback. Flags: `--extensions=`, `--verify`, `--skip-wtr`,
  `--checkpoint=`.
- `transformer.mjs` — core. Pass A classifies every scope binding as renameable or preserved.
  Pass B emits replacements for the declaration and every reference, applied end-to-start.
- `analyzer.mjs` — marks public identifiers: exports (including destructured exports), and the
  member surface of exported classes and `LightningElement` components.
- `globals.mjs` — JS/DOM globals and LWC lifecycle hooks that must never be renamed.
- `confusables-map.mjs` — ASCII → confusable character mappings.
- `hash.mjs` — deterministic per-name character selection (pure function of the identifier,
  so a name maps to one target everywhere and re-runs are idempotent).
- `transformer.test.mjs` — 20 unit tests (run with `node --test`), one per bug class below
  plus determinism and the basic preserve/rename cases.

### Bindings that are preserved (never renamed)

- Globals (`globals.mjs`) and exported/public names (`analyzer.mjs`).
- Imported names (`binding.kind === 'module'`, plus `import type` whose binding kind is
  `'unknown'` — matched on the import declaration node type instead).
- Type-space declarations: type aliases, interfaces, enums, namespaces, type parameters,
  `import =`, and constructor parameter properties.
- `this` parameters (`function (this: T)` — a contextual keyword, not a binding).
- Private class field names (`#field`) — class members in their own namespace, never resolved
  through a same-named local.
- Object property keys, member-access property names, import/export specifier names.

### Bug classes handled (each has a regression test)

1. Local binding consistency — declaration + all references rename together.
2. `import type` bindings (kind `'unknown'`) preserved like value imports.
3. Type aliases/interfaces left untouched (declaration and reference stay in sync).
4. Object-expression shorthand (`{ scope }` → `{ scope: <renamed> }`, key stays ASCII).
5. Object-pattern shorthand (`const { dir } = obj` → `const { dir: <renamed> }`).
6. Shorthand pattern with default (`{ namespace = '' }` → `{ namespace: <renamed> = '' }`).
7. Assertion signatures (`asserts x`) rename in lockstep with the parameter.
8. Type predicates (`x is T`) rename in lockstep with the parameter.
9. `typeof X` value references in type space.
10. Exported destructuring locals (`export const { ELEMENT_NODE } = _Node`) preserved.
11. `this` parameter never renamed.
12. Private class field never renamed even when a same-named local exists.
13. A class referenced from type position (`new SignalTracker()` + `WeakMap<_, SignalTracker>`)
    renames in lockstep — classes are the only renameable binding that can appear as a direct
    type reference.
14. A type reference that collides with a renameable value name (e.g. `...Validators: Validators`
    where `Validators` is also a type parameter) is NOT renamed — `getBinding` only tracks the
    value binding, so the type-parameter reference must stay ASCII.
15. Computed type-member key (`interface I { [HostElementKey]: T }`) referencing a renamed value
    binding renames in lockstep.

## Reproducing from scratch

```bash
git restore --source=master -- ':(glob)packages/@lwc/*/src/**'   # clean baseline
node scripts/confusables/transform.mjs --extensions=ts,js,mjs,cjs
yarn build && yarn test && yarn test:wtr                          # all exit 0
```

The transform is deterministic: re-running from a clean baseline produces byte-identical output.

## Caveats

- This is an educational/research artifact. Do not ship it: it defeats code review, search,
  refactoring, and stack-trace readability, and introduces homograph-attack surface.
- ESLint's "unused variable" heuristics may flag renamed identifiers; commits to this branch
  may need `--no-verify` if a pre-commit lint hook is configured.
