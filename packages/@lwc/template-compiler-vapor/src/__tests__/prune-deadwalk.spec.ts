/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, test, expect } from 'vitest';
import { compileVapor } from '../compile';

/*
 * Regression test for the dead-node-walk prune (create/append mount perf).
 *
 * `nthChild(node, i)` compiles to a side-effect-free `node.childNodes[i]` read. The
 * codegen numbers a stable node var for EVERY element it visits, but only some are
 * referenced downstream (by a renderEffect binding, event delegate, or insert anchor).
 * Previously the compiler emitted a `const nX = nthChild(...)` for ALL of them, so a
 * for:each row body ran ~11 dead live-NodeList index reads per row — wasted work that a
 * bundler can't dead-code-eliminate (it can't prove `nthChild` has no side effect). At
 * 10k rows an @best A/B measured this at ~8-9.5% of create-1k. The fix materializes only
 * refs whose var actually appears in the emitted body. Every traversal is ROOT-ANCHORED
 * (buildTraversal walks from the root var; refs never reference each other at runtime),
 * so an unreferenced ref is provably dead and dropping it is semantics-preserving.
 */
describe('vapor codegen — dead node-walk prune', () => {
    test('drops const declarations for nodes no binding references', () => {
        // Row with 4 cells; only cells 0 and 3 hold dynamic text. The structural
        // wrappers (<td>/<a>/<span>) and static-only cells must NOT be declared.
        const { code } = compileVapor(
            `<template><tr><td class="a">{first}</td><td class="b"><a>link</a></td><td class="c"><span>x</span></td><td class="d">{second}</td></tr></template>`
        );
        // The two referenced text nodes ARE declared, root-anchored. (The var counter
        // still advances for skipped nodes, so the kept vars are n2 and n8 — the point
        // is that ONLY the referenced nodes get a `const`, not that the numbers are
        // contiguous.)
        expect(code).toContain('const n2 = nthChild(nthChild(n0, 0), 0);');
        expect(code).toContain('const n8 = nthChild(nthChild(n0, 3), 0);');
        // No OTHER node-ref const is emitted (n0 is the template root `t0()`).
        const declared = [...code.matchAll(/const (n\d+) = /g)].map((m) => m[1]).sort();
        expect(declared).toEqual(['n0', 'n2', 'n8']);
        // The skipped structural nodes get no declaration at all.
        expect(code).not.toContain('const n1');
        expect(code).not.toContain('const n3');
        expect(code).not.toContain('const n4');
    });

    test('keeps refs used only as an insert anchor (not just effects)', () => {
        // The <!----> anchor node (n1) is referenced by `insert(d0, n0, n1)`, not by any
        // effect — the prune must keep it. A regression here would break for:each
        // positioning, so this guards the "referenced anywhere in the body" contract.
        const { code } = compileVapor(
            `<template><ul><li for:each={items} for:item="item" key={item.id}>{item.label}</li></ul></template>`
        );
        expect(code).toContain('const n1 = nthChild(n0, 0);');
        expect(code).toContain('insert(d0, n0, n1);');
    });

    test('all-static template declares no node refs beyond the root', () => {
        const { code } = compileVapor(
            `<template><div><span>a</span><span>b</span></div></template>`
        );
        const declared = [...code.matchAll(/const (n\d+) = /g)].map((m) => m[1]);
        expect(declared).toEqual(['n0']);
    });
});
