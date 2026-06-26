# Confusable Characters Transformation — Handoff

## Status

**Branch:** `wjh-ai/confusable-characters` (base: `master`)

**Verified state:** 377 source files transformed across 23 `@lwc` packages. All three
acceptance gates pass with exit code 0:

- `yarn build` — all 21 build projects succeed (tsc type-check is the strict gate).
- `yarn test` — vitest: 77 files, 2817 passed, 10 skipped, 2 expected-fail, exit 0. (The "2
  expected fail" are `render-undefined` / `render-bad-value`, declared via `expectedFailures`;
  they fail on clean `master` too — pre-existing baseline, not introduced here.)
- `yarn test:wtr` — `@lwc/integration-wtr` across Chromium/Firefox/WebKit: 3496 passed per
  browser, 0 failed, exit 0.

**Goal:** Replace ASCII identifiers in LWC source with visually-similar Unicode "confusable"
characters while preserving every public API and keeping the build and test suites green.

## Scope

This is the second phase. Phase 1 (commit `1eb6c6f69`) renamed local/value identifiers but
**deliberately preserved the entire module-import/export surface and all of type space** as a
cross-module string contract. This phase removes both of those safety nets: imports, exports,
and type-space names are now renamed too. The external string contract is preserved by
**aliasing at the module boundary** — the confusable is the local name, the ASCII name is the
imported/exported specifier.

Transformed: identifiers in `.ts` and non-test `.js`/`.mjs`/`.cjs` under `packages/@lwc/*/src`.

Excluded: `dist`, `__tests__`, `__mocks__`, `fixtures`, `*.snap`, `*.spec.*`, `*.test.*`,
`*.d.ts`, and any `.js`/`.ts` with a colocated `.html` (LWC component templates bind member
names by string, so a component's class surface is preserve-only). `.html`/`.css` are never
rewritten.

## How it works

The transformer is **binding-driven** and emits **occurrence-based text-slice replacements**
(`{start, end, text}` applied end-to-start), not via `@babel/generator`. A single
classification per binding guarantees a declaration and all its references either all rename or
none do.

`transformIdentifier(name)` is a pure, deterministic function of the name (via `simpleHash`),
so a name maps to one confusable everywhere and re-runs from a clean baseline are
byte-identical.

### Boundary aliasing — the import/export contract

Let `L` = local name and `C = transformIdentifier(L)`. The external string (the imported or
exported name) is always preserved; only the local binding is renamed.

| Form | Result |
|---|---|
| `import Foo from 'x'` | `import C from 'x'` (default; contract is literal `default`, no alias) |
| `import { foo } from 'x'` | `import { foo as C } from 'x'` |
| `import { foo as bar } from 'x'` | `import { foo as Cbar } from 'x'` (replace local only) |
| `import * as NS from 'x'` | `import * as C from 'x'` (namespace local) |
| `import type { X } from 'x'` | `import type { X as C } from 'x'` |
| `export { local }` | `export { C as local }` |
| `export { local as Pub }` | `export { C as Pub }` |
| inline `export function/class/const` | strip `export`, rename decl + refs, append `export { C as name };` |
| `export type/interface X` | rename decl + refs, append `export { type C as X };` |
| `export default function foo` | rename `id` freely (export name is `default`, no alias) |
| re-exports (`export … from`, `export * from`) | untouched (no local binding) |

For a declaration that is both a value and a type (`export const X` + `export type X`, or a
`const`/`type` merge), a single non-`type` export specifier carries both meanings — emitting a
separate `type` re-export would duplicate the identifier (TS2300), so the type half is
strip-only.

Overloaded functions: TS requires every overload signature (`TSDeclareFunction`) and the
implementation (`FunctionDeclaration`) to agree on `export`. The restructure strips `export`
from all of them and emits exactly one aliased specifier for the implementation.

### `scripts/confusables/`

- `transform.mjs` — orchestrator. Globs `packages/@lwc/*/src/**/*.{ts,js,mjs,cjs}` with the
  exclusions above, parses per-extension (TypeScript plugin only for `.ts`), transforms, runs
  `yarn format`, and (with `--verify`) gates on build/test/test:wtr with optional
  `--checkpoint=<ref>` rollback. Flags: `--extensions=`, `--verify`, `--skip-wtr`,
  `--checkpoint=`.
- `transformer.mjs` — core. Pass A classifies value bindings; A2 collects renameable type
  names; A2b collects value-exported names (for the value+type merge dedup); A3 is the
  coverage prescan that drops any name with an uncovered occurrence. Pass B emits replacements
  for declarations, references, import/export specifiers, and inline-export restructuring.
- `analyzer.mjs` — protects the member surface of exported classes and `LightningElement`
  components (template-bound by string) via a separate `exportedClassLocals` set; it no longer
  adds export names to a public-preserve set, because export *locals* now rename.
- `globals.mjs` — JS/DOM globals and LWC lifecycle hooks that must never be renamed.
- `confusables-map.mjs` — ASCII → confusable character mappings.
- `hash.mjs` — deterministic per-name character selection.
- `transformer.test.mjs` — 37 unit tests (`node --test`), one per import/export/type-space form
  plus the bug classes below.

### Type space (the fragile part)

Type-position visitors (`TSTypeReference`, heritage `TSExpressionWithTypeArguments`,
`TSIndexedAccessType`, `TSTypeQuery` for `typeof`, computed type-member keys, type predicates)
rename the leftmost identifier iff it resolves to a renameable type name or value binding AND is
not shadowed by an enclosing `TSTypeParameter` of the same name.

**Conservative fallback:** Pass A3 prescans each type-space name; if any occurrence sits in a
form no visitor covers, the name is dropped from the renameable set and left ASCII (decl + refs
both ASCII → tsc still passes). In practice this rarely fires, because mapped-type constraints
(`[K in Keys]`) and template-literal types resolve through `TSTypeReference` positions and are
therefore covered.

### `.name`-reflection consequences (intended)

Because inline-exported declarations are renamed, `Function.prototype.name` / `Class.name` now
returns the confusable even though the export specifier preserves the ASCII name. Three places
observe this at runtime and were updated to match (not source bugs — expected output changes):

- `ssr-compiler` `barrel-lwc-exports` fixtures (×3) read `i.name` and normalize the SSR-runtime
  `renderComponent` alias; the normalization and the `expected.html` snapshots were regenerated
  to the confusable names.
- `integration-wtr` `polyfills/shadow-root` spec asserts `String(window.ShadowRoot)`; the regex
  was widened to accept the confusable `SyntheticShadowRoot` name.

## Bug classes handled (each has a regression test)

1. Local binding consistency — declaration + all references rename together.
2–8. Import/export specifier forms (default, named, aliased, namespace, type-only, inline-decl
   restructure, re-export-untouched) per the table above.
9. Value+type declaration merge — single specifier, no duplicate `type` re-export.
10. Overload signatures (`TSDeclareFunction`) — `export` stripped in lockstep with the impl.
11. `typeof X` on a type-only import resolves and renames.
12. Computed type-member key referencing a renamed binding renames in lockstep.
13. Object-expression / object-pattern shorthand expansion (key stays the contract name).
14. Assertion signatures (`asserts x`) and type predicates (`x is T`) rename with the parameter.
15. Type parameter shadowing — a type reference shadowed by an enclosing `TSTypeParameter` of
    the same name stays ASCII (the `Validators` collision).

## Reproducing from scratch

```bash
git restore --source=master -- ':(glob)packages/@lwc/*/src/**'   # clean baseline
node scripts/confusables/transform.mjs --extensions=ts,js,mjs,cjs
yarn build && yarn test && yarn test:wtr                          # all exit 0
```

The transform is deterministic: re-running from a clean baseline produces byte-identical output.
The three `.name`-reflection edits above live under `__tests__/` (excluded from the transform),
so they survive a re-run and do not need to be re-applied.

## Caveats

- This is an educational/research artifact. Do not ship it: it defeats code review, search,
  refactoring, and stack-trace readability, and introduces homograph-attack surface.
- ESLint's "unused variable" heuristics flag renamed identifiers; commits to this branch need
  `--no-verify` because the pre-commit lint hook would otherwise reject them.
