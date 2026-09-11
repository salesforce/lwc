# Vapor Anchorless Iterator + Fragment Bookend Model — Exact Design

Reverse-engineered from the STANDARD compiler output + engine-core `api.ts` (the
ground truth for the `<!---->` delimiter structure). This is the design for the
Cluster C+D bookend rewrite. Prior piecemeal anchor-adoption attempts were
net-negative (72→79) because they guessed at the structure; this doc has the exact rule.

## The exact engine-core model

Standard compiler output for issue-3377 (`for:each` then `lwc:if`):

```js
api_flatten([
  api_iterator($cmp.items, item =>
    api_static_fragment($fragment1, api_key(1, item), [...])),   // for:each
  $cmp.items ? api_fragment(2, [api_static_fragment($fragment2, 4)], 0) : null  // lwc:if
])
```

### Rule 1 — `for:each` (`api_iterator`) contributes ZERO delimiters.

Each iterated item is an `api_static_fragment` (a plain cloned element subtree, NO
bookends). The iterator itself adds NOTHING — no leading/trailing/anchor comment.
The list's position is held by `api_flatten` merging it into the parent's flat
children array (its siblings provide the positional reference).

### Rule 2 — `lwc:if` (`api_fragment` = `fr()`) is bracketed by a leading+trailing comment PAIR.

`fr(key, children, stable)` returns `{ children: [leading, ...children, trailing] }`
where `leading`/`trailing` are `co('')` comment nodes (api>=60 USE_COMMENTS_FOR_FRAGMENT_BOOKENDS).
So EVERY `lwc:if` (standalone OR as a `for:each` item) renders as
`<!----> ...content... <!---->` — exactly two comments.

### Worked examples (both match engine-dom exactly):

- issue-3377 `items=[0,1]`, if=true →
  `[<div>0</div>, <div>1</div>, <!---->, <div>lwc:if</div>, <!---->]`
  = `['0','1','','lwc:if','']`. for:each=0 comments, if=2 comments. ✓
- sequential-reordering `beforeItems=['foo']` (item is itself `lwc:if`), standalone-if (一二三), afterItems=[] →
  `['', 'foo', '', '', '一','二','三', '']`. Each item-if=2 comments, standalone-if=2 comments, for:each=0. ✓

## What vapor does today (the gap)

- The compiler emits a positional `<!---->` anchor for EACH control-flow block
  (`t2 = "<!----><!---->"`), and `createFor`'s `VaporFragment` ALSO creates its OWN
  anchor comment. So a `for:each` contributes 1 (compiler) + 1 (own) = 2 comments
  where engine-core has 0.
- `lwc:if`'s `DynamicFragment` already has `start`+`anchor` (2 comments) — CORRECT
  per Rule 2 — BUT it ALSO adopts the compiler anchor, and the compiler anchor is
  an extra node. Net: if = 3 comments where engine-core has 2.

## The fix (interdependent; must land together)

1. **Compiler**: STOP emitting a positional anchor for `for:each`. The list is
   anchorless. (For `lwc:if`, the DynamicFragment provides its OWN start+anchor —
   the compiler should NOT emit an if anchor either; OR keep ONE if-anchor and have
   the DynamicFragment adopt it as its trailing `anchor` while still inserting `start`.)
2. **createFor (runtime)**: NO own anchor comment. Position the list using the
   NEXT-SIBLING DOM reference at insert time (the following control-flow block's
   leading comment, or the parent's end). Reconcile by inserting items before that
   next-sibling reference. This is the anchorless iterator — the perf-critical path,
   so the reconcile must still resolve its parent + insertion point cheaply (cache
   the next-sibling node; on teardown of the following sibling, recompute).
3. **DynamicFragment (lwc:if)**: keep `start`+`anchor`; do NOT adopt a compiler
   anchor (there won't be one for the if either, OR adopt exactly one and keep start).

## Why piecemeal failed (measured)

Naive "adopt the compiler anchor + suppress start" globally:

- Fixed issue-3377 (+1) but regressed slotting, issue-3396, lwc:if-foreach,
  scoped-slots (−7) → net 72→79. The slot path and nested-fragment cases rely on the
  start bookend AND on the compiler anchor in ways that a blanket rule breaks.

## Risk / gating

- Blast radius: EVERY `for:each`, `lwc:if`, and `<slot>` (slots use DynamicFragment
    - light-DOM resolveLightDomSlots which brackets with its own bookends).
- The anchorless `createFor` is on the krausest perf path — must re-measure (the
  next-sibling positioning must not add per-item DOM walks).
- Gate per construct: issue-3377, sequential-reordering, slot-not-at-top-level,
  issue-3396, lwc:if-foreach, scoped-slots, slotting, then full gate + perf.
- This intersects Cluster D (slot distribution): the light-DOM slot bookend shape
  (`resolveLightDomSlots`) must align with the same single-pair-per-fragment rule.

## Status

DESIGN COMPLETE (exact model nailed via standard-compiler probe). NOT YET
IMPLEMENTED — it is a coordinated compiler + createFor + block.ts rewrite with high
blast radius across all control-flow + slots, requiring its own focused, fully-gated
pass. The foundational reactivity (readonly membrane, @api-accessor reactivity) and
the async-render assessment are done; this bookend rewrite is the next major item.
