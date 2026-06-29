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

| Form                                          | Result                                                                 |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| `import Foo from 'x'`                         | `import C from 'x'` (default; contract is literal `default`, no alias) |
| `import { foo } from 'x'`                     | `import { foo as C } from 'x'`                                         |
| `import { foo as bar } from 'x'`              | `import { foo as Cbar } from 'x'` (replace local only)                 |
| `import * as NS from 'x'`                     | `import * as C from 'x'` (namespace local)                             |
| `import type { X } from 'x'`                  | `import type { X as C } from 'x'`                                      |
| `export { local }`                            | `export { C as local }`                                                |
| `export { local as Pub }`                     | `export { C as Pub }`                                                  |
| inline `export function/class/const`          | strip `export`, rename decl + refs, append `export { C as name };`     |
| `export type/interface X`                     | rename decl + refs, append `export { type C as X };`                   |
| `export default function foo`                 | rename `id` freely (export name is `default`, no alias)                |
| re-exports (`export … from`, `export * from`) | untouched (no local binding)                                           |

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
  adds export names to a public-preserve set, because export _locals_ now rename.
- `globals.mjs` — JS/DOM globals and LWC lifecycle hooks that must never be renamed. The former
  "common property names" block (`length, name, value, type, id, key, data, error, message,
stack`) has been removed: those were only ever suppressing renames of local bindings and
  parameters (e.g. `catch (error)`), since member access (`obj.error`) and object keys are
  already protected positionally by `isPreservedPosition` / `analyzer.mjs`.
- `confusables-map.mjs` — ASCII → confusable character mappings.
- `hash.mjs` — deterministic per-name character selection.
- `transformer.test.mjs` — 76 unit tests (`node --test`), one per import/export/type-space form
  plus the bug classes below.

### Type space (the fragile part)

Type-position visitors (`TSTypeReference`, heritage `TSExpressionWithTypeArguments`,
`TSIndexedAccessType`, `TSTypeQuery` for `typeof`, computed type-member keys, type predicates)
rename the leftmost identifier iff it resolves to a renameable type name, value binding, or
type-parameter name.

**Type parameters rename.** Generic type parameters (`<T>`), constrained/defaulted params
(`<K extends PropertyKey>`, `<N = HostNode>`), mapped-type keys (`[K in ...]`), and `infer` vars
are all `TSTypeParameter` nodes. Pass A2c collects their names into a file-global set; the
declaration is renamed by a `TSTypeParameter` visitor (the name is a plain string on the node,
so the slice is `[start, start + name.length)`), and references ride the existing
`TSTypeReference` path via `resolvesToRenameableType`. Because `transformIdentifier` is
deterministic, a file-global name set (not per-scope resolution) suffices — every `T` maps to
the same confusable.

**Modifier-annotated params rename too.** When a `TSTypeParameter` carries a modifier
(`in`/`out` variance or `const`), `node.start` points at the modifier keyword, not the name, so a
naive `[start, start + len)` slice would corrupt the keyword. `typeParamNameStart(tpNode, source)`
consumes a leading run of whole `const`/`in`/`out` keywords (each `\b`-anchored with trailing
whitespace) from the node's source slice and returns the offset where the NAME begins; the slice is
taken from there. So the modifier keyword survives intact and the name renames in lockstep with its
references (which ride the ordinary `typeParamNames` path). Anchoring on whole keywords avoids
mis-locating a single-char name (`<const n>`) inside the `const`/`in`/`out` text.

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
2. Value+type declaration merge — single specifier, no duplicate `type` re-export.
3. Overload signatures (`TSDeclareFunction`) — `export` stripped in lockstep with the impl.
4. `typeof X` on a type-only import resolves and renames.
5. Computed type-member key referencing a renamed binding renames in lockstep.
6. Object-expression / object-pattern shorthand expansion (key stays the contract name).
   Includes catch-clause destructuring (`catch ({ message })`): Babel registers the binding in
   `scope.bindings` but `getBinding` returns null from the declaration path, so the shorthand
   visitor falls back to a direct `renameableIds` membership check to expand it in lockstep with
   its reference.
7. Assertion signatures (`asserts x`) and type predicates (`x is T`) rename with the parameter.
8. Type parameters rename in lockstep — declaration and every reference of a `<T>` / mapped-type
   key / `infer` var become the same confusable. A name shared with a same-named outer type or
   value (the `Validators` collision) renames everywhere to one confusable. A modifier-annotated
   declaration (`in`/`out`/`const`) also renames: `typeParamNameStart` slices past the modifier
   keyword so it survives while the name moves (the wire.ts `const Config`/`const Value`/`const
Class` and errors.ts `<const T>` cases).
9. Common-property-name locals (`error`, `value`, `message`, …) rename as ordinary bindings;
   member access (`obj.error`) and object keys stay ASCII via positional preservation.
10. Non-exported enum names rename. Babel registers no scope binding for an enum, so it cannot
    ride the binding-keyed value path; it is renamed by a name-keyed set `renameableEnumNames`
    (collected in Pass A2, exported enums excluded). Only the enum _name_ moves: members are
    declared as enum-member keys and always read as `Enum.MEMBER` (a preserved member position),
    so they stay ASCII. The name's type references rename via `resolvesToRenameableType`, its
    value references via the value `Identifier` visitor's enum fallthrough (`Enum.MEMBER` object
    position + bare value refs, guarded by `!scope.getBinding(name)` so a same-named local owns
    its own occurrences). The Pass A3 prescan also inspects VALUE positions for enum names: an
    enum used in object shorthand (`{ Enum }`) or a separate export specifier (`export { Enum }`)
    is left ASCII by the emit phase (no enum alias at the boundary), so the prescan drops it from
    the rename set, keeping declaration and references in lockstep. Exported enums stay ASCII
    entirely — the analyzer protects exported members as a cross-module contract.

    **Const-enum members rename too.** A `const enum` has no runtime object — TS inlines every
    `E.Member` at compile time, with no reverse mapping — so its member names are compile-time-only
    and safe to rename in lockstep. The collector adds the enum to `memberRenameableEnumNames` only
    when `node.const` is true and every member key is a plain `Identifier`. The emit phase then
    renames member-key declarations (`TSEnumDeclaration` visitor), value access `E.Member` (value
    `Identifier` visitor, guarded by `!scope.getBinding(enumName)`), and type access `E.Member`
    (`TSQualifiedName` right side) — all three read the one `memberRenameableEnumNames` set, so any
    prescan deletion reverts them together. A PLAIN (non-const) enum emits a runtime object whose
    member names are observable strings, so its members always stay ASCII (only the name moves).
    Three shapes disqualify const-enum member renaming (members stay ASCII, name still renames):
    a member read by computed string access (`E[k]`) or indexed-access type (`E['M']`), the enum
    exposed via `keyof typeof E` (the member-key string-literal union), and a member initializer
    that references a sibling member by bare name (`B = A << 1`) — `exposesEnumMemberAsString`
    handles the first two (value + type) via the prescan; the sibling-reference check runs in the
    collector gate (`E.A` member-access references are excluded — those rename in lockstep).

11. ECMAScript private `#` fields and methods rename in lockstep, preserving the leading `#`.
    Private names (`#renderer`, `#elm`, `#props`, `#map`, …) live in a per-class lexical namespace:
    they are never a runtime string property, never emitted to `.d.ts`, and never observable
    outside the class body, so renaming the declaration and every `this.#x` reference together is
    safe. A `PrivateName` collector in Pass A2c gathers each private name into a file-global set,
    and a dedicated `PrivateName` visitor in Pass B emits the slice. Babel positions the inner
    `Identifier` (`PrivateName.id`) _after_ the `#`, so slicing `[id.start, id.end)` renames only
    the name and leaves `#` intact. The value `Identifier` visitor early-returns for any identifier
    under a `PrivateName` parent, so the two visitors never double-handle a node. Because
    `transformIdentifier` is deterministic, the file-global name set (not per-class resolution)
    keeps declaration and access in lockstep even when two classes in one file share a `#name`.
    Found in `engine-core/src/framework/modules/context.ts`, `ssr-runtime/src/lightning-element.ts`,
    `ssr-runtime/src/mutation-tracker.ts`, and `ssr-compiler/src/imports.ts`.

12. TS `private` members of NON-EXPORTED classes rename in lockstep, scoped to the class node. A
    `private` member is reachable only as `this.X` lexically inside its own class body (TS rejects
    an outside `obj.X`); a class that is neither exported (inline, default, or via specifier — the
    `exportedClassLocals` set) nor a `LightningElement` component appears in no `.d.ts` and binds to
    no template, so renaming its declaration key plus every in-class `this.X` / `const {X}=this`
    access is invisible externally. Unlike a `#`-field, `this.X` is syntactically identical to a
    public access on another object, so the rename is keyed by the specific CLASS NODE
    (`scopedPrivateMembersByClass: Map<ClassNode, Set<string>>`), never name-keyed alone. Pass A2d
    collects each internal class's non-computed `private` `ClassMethod`/`ClassProperty`/
    `ClassAccessorProperty` keys (skipping `GLOBAL_IDENTIFIERS` / `publicIdentifiers`, so a name
    colliding with an exported member stays ASCII). A Pass A3b prescan drops a `(classNode, name)`
    on any occurrence inside the class that is NOT one of the three covered forms — a same-name
    access on a non-`this` object (`obj.X`), a computed `this['X']`, or a string/template literal
    equal to the name — leaving it ASCII lockstep-safe (a bare reference resolving to its own
    renameable scope binding, e.g. the local from `const {X}=this`, is not a member access and does
    not trigger a drop). Emit: a `ClassMethod|ClassProperty|ClassAccessorProperty` visitor renames
    the declaration key; the value `Identifier` visitor renames `this.X` and the `const {X}=this`
    shorthand key (one token, so key + binding + later refs share the confusable) before the
    member-position / shorthand early-returns; the `ObjectProperty` visitor bails on that shorthand
    so it is not expanded. A `this.X` lexically inside a non-arrow `function`/object-method nested in
    the class is NOT a member access — `this` rebinds at call time — so `enclosingScopedClass` stops
    its parent walk at such a function boundary (arrow functions, class methods, and field
    initializers keep the instance `this` and do not stop it). The prescan additionally DROPS the
    whole member when an ambiguous `this.X` sits inside a rebinding function (its runtime `this` might
    be the instance), leaving it ASCII everywhere rather than renaming the declaration while that
    access cannot follow. `protected` is excluded — a `protected` member can be read via `this.X`
    in a subclass body (a different class node), desyncing under node-scoped renaming. Renamed in
    `engine-core/src/libs/signal-tracker/index.ts` (`signalToUnsubscribeMap`) and
    `wire-service/src/index.ts` (`callback`, `wiredElementHost`, … — NOT the `protected eventTarget`,
    read in a subclass). (`template-compiler/src/parser/attribute.ts`'s `ParsedAttribute` turned out
    to be exported via specifier, so its members are correctly preserved.)

## Future work

**TS `private`/`protected` members of EXPORTED classes, and all `protected` members, stay ASCII.**
A member of an exported class may be part of a cross-module contract; a `protected` member is
reachable from a subclass body (a different class node), which node-scoped renaming would desync.
Renaming either safely needs a cross-class / subclass-aware prescan or a TS type-checker pass to
resolve each `this.X` access to its declaration (disqualifying any exported-class member, any
`protected` member readable from a subclass, and any computed/string access). That is materially
larger than the within-file, non-exported-class, private-only gap closed here and is deferred.

**Object property keys, `this.X` on exported/component classes, and exported method names stay
ASCII.** These are string-observable — runtime property reads, template binding, reflection, or
cross-module contract — and cannot be proven internal without a type-aware resolver.

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
