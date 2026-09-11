/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 *
 * Performance benchmarks comparing the vapor (VDOM-less) update model against a
 * representative virtual-DOM update model (create new vnode tree -> diff ->
 * patch). These run under `vitest bench`.
 *
 * NOTE: These are *isolated update* micro-benchmarks — they measure the cost of
 * applying changes to an already-mounted tree, which is where fine-grained
 * reactivity is strongest, so they are favorable to vapor. For the full,
 * industry-standard picture — including initial mount and teardown, where vapor
 * pays a setup tax — see `krausest.bench.ts`, which ports Vue Vapor's own
 * js-framework-benchmark suite.
 *
 * The vapor path uses fine-grained reactive effects that write directly to the
 * DOM. The VDOM baseline mimics what engine-core does: rebuild a lightweight
 * vnode tree on every update and diff it against the previous tree before
 * touching the DOM.
 */
import { bench, describe } from 'vitest';
import { template } from '../dom/template';
import { setText, setAttr } from '../dom/prop';
import { child } from '../dom/node';
import { renderEffect } from '../renderEffect';
import { createReactiveProxy } from '../reactivity';
import { insertBlock } from '../block';

// ---------------------------------------------------------------------------
// Minimal VDOM baseline (mirrors the create -> diff -> patch model)
// ---------------------------------------------------------------------------

interface VNode {
    tag: string;
    props: Record<string, any>;
    text: string;
    children: VNode[];
    elm?: HTMLElement | Text;
}

function h(tag: string, props: Record<string, any>, text: string, children: VNode[] = []): VNode {
    return { tag, props, text, children };
}

function mountVNode(vnode: VNode): HTMLElement | Text {
    if (vnode.tag === '#text') {
        const t = document.createTextNode(vnode.text);
        vnode.elm = t;
        return t;
    }
    const el = document.createElement(vnode.tag);
    for (const key of Object.keys(vnode.props)) {
        el.setAttribute(key, vnode.props[key]);
    }
    if (vnode.text) {
        el.textContent = vnode.text;
    }
    for (const child of vnode.children) {
        el.appendChild(mountVNode(child));
    }
    vnode.elm = el;
    return el;
}

function patchVNode(oldV: VNode, newV: VNode): void {
    const elm = (newV.elm = oldV.elm) as HTMLElement;
    if (newV.tag === '#text') {
        if (oldV.text !== newV.text) {
            (elm as unknown as Text).nodeValue = newV.text;
        }
        return;
    }
    // Diff props
    for (const key of Object.keys(newV.props)) {
        if (oldV.props[key] !== newV.props[key]) {
            elm.setAttribute(key, newV.props[key]);
        }
    }
    // Diff text
    if (oldV.text !== newV.text && newV.children.length === 0) {
        elm.textContent = newV.text;
    }
    // Diff children (position-based)
    const len = Math.min(oldV.children.length, newV.children.length);
    for (let i = 0; i < len; i++) {
        patchVNode(oldV.children[i], newV.children[i]);
    }
}

// ---------------------------------------------------------------------------
// Benchmark: a list of 100 rows, each with a dynamic text label and an
// attribute. We measure the cost of updating every row's data.
// ---------------------------------------------------------------------------

const ROW_COUNT = 100;
const UPDATE_ITERATIONS = 50;

describe('update 100 rows of dynamic text', () => {
    bench('vapor (fine-grained reactive effects)', () => {
        const container = document.createElement('div');
        const state = createReactiveProxy({
            rows: Array.from({ length: ROW_COUNT }, (_, i) => ({ id: i, label: `row ${i}` })),
        });

        const rowTemplate = template('<div> </div>');

        // Build rows with one effect per dynamic text node.
        for (let i = 0; i < ROW_COUNT; i++) {
            const node = rowTemplate() as HTMLElement;
            const textNode = child(node);
            const index = i;
            renderEffect(() => setText(textNode as Text, state.rows[index].label));
            insertBlock(node, container);
        }

        // Update all rows repeatedly.
        for (let iter = 0; iter < UPDATE_ITERATIONS; iter++) {
            const next = state.rows.map((r) => ({ id: r.id, label: `row ${r.id} v${iter}` }));
            state.rows = next;
        }
    });

    bench('vdom (create + diff + patch)', () => {
        const container = document.createElement('div');
        let rows = Array.from({ length: ROW_COUNT }, (_, i) => ({ id: i, label: `row ${i}` }));

        const buildTree = (data: typeof rows): VNode =>
            h(
                'div',
                {},
                '',
                data.map((r) => h('div', {}, r.label))
            );

        let oldTree = buildTree(rows);
        container.appendChild(mountVNode(oldTree));

        for (let iter = 0; iter < UPDATE_ITERATIONS; iter++) {
            rows = rows.map((r) => ({ id: r.id, label: `row ${r.id} v${iter}` }));
            const newTree = buildTree(rows);
            patchVNode(oldTree, newTree);
            oldTree = newTree;
        }
    });
});

describe('update single value among 100 static rows', () => {
    // This is where fine-grained reactivity shines: only one node updates,
    // but VDOM must rebuild + diff the entire tree.
    bench('vapor (only the changed node re-runs)', () => {
        const container = document.createElement('div');
        const state = createReactiveProxy({ counter: 0, rows: 100 });

        const rowTemplate = template('<div> </div>');
        for (let i = 0; i < state.rows; i++) {
            const node = rowTemplate() as HTMLElement;
            const textNode = child(node);
            if (i === 0) {
                renderEffect(() => setText(textNode as Text, String(state.counter)));
            } else {
                (textNode as Text).nodeValue = `static ${i}`;
            }
            insertBlock(node, container);
        }

        for (let iter = 0; iter < UPDATE_ITERATIONS; iter++) {
            state.counter = iter;
        }
    });

    bench('vdom (full tree rebuild + diff per change)', () => {
        const container = document.createElement('div');
        let counter = 0;

        const buildTree = (c: number): VNode =>
            h(
                'div',
                {},
                '',
                Array.from({ length: 100 }, (_, i) =>
                    h('div', {}, i === 0 ? String(c) : `static ${i}`)
                )
            );

        let oldTree = buildTree(counter);
        container.appendChild(mountVNode(oldTree));

        for (let iter = 0; iter < UPDATE_ITERATIONS; iter++) {
            counter = iter;
            const newTree = buildTree(counter);
            patchVNode(oldTree, newTree);
            oldTree = newTree;
        }
    });
});

describe('realistic mixed update: 100 rows with text + class + attr', () => {
    // Representative of real components: each row binds dynamic text, a class,
    // and an attribute. This is the case that actually appears in templates.
    bench('vapor', () => {
        const container = document.createElement('div');
        const state = createReactiveProxy({
            rows: Array.from({ length: ROW_COUNT }, (_, i) => ({
                id: i,
                label: `row ${i}`,
                active: false,
            })),
        });

        const rowTemplate = template('<div> </div>');
        for (let i = 0; i < ROW_COUNT; i++) {
            const node = rowTemplate() as HTMLElement;
            const textNode = child(node);
            const index = i;
            renderEffect(() => {
                const row = state.rows[index];
                setText(textNode as Text, row.label);
                setAttr(node, 'data-active', row.active ? 'yes' : 'no');
                node.className = row.active ? 'active' : '';
            });
            insertBlock(node, container);
        }

        for (let iter = 0; iter < UPDATE_ITERATIONS; iter++) {
            state.rows = state.rows.map((r) => ({
                id: r.id,
                label: `row ${r.id} v${iter}`,
                active: iter % 2 === 0,
            }));
        }
    });

    bench('vdom', () => {
        const container = document.createElement('div');
        let rows = Array.from({ length: ROW_COUNT }, (_, i) => ({
            id: i,
            label: `row ${i}`,
            active: false,
        }));

        const buildTree = (data: typeof rows): VNode =>
            h(
                'div',
                {},
                '',
                data.map((r) =>
                    h(
                        'div',
                        { 'data-active': r.active ? 'yes' : 'no', class: r.active ? 'active' : '' },
                        r.label
                    )
                )
            );

        let oldTree = buildTree(rows);
        container.appendChild(mountVNode(oldTree));

        for (let iter = 0; iter < UPDATE_ITERATIONS; iter++) {
            rows = rows.map((r) => ({
                id: r.id,
                label: `row ${r.id} v${iter}`,
                active: iter % 2 === 0,
            }));
            const newTree = buildTree(rows);
            patchVNode(oldTree, newTree);
            oldTree = newTree;
        }
    });
});

describe('update attributes on 100 elements', () => {
    bench('vapor', () => {
        const container = document.createElement('div');
        const state = createReactiveProxy({ active: false });
        const elTemplate = template('<div></div>');

        for (let i = 0; i < ROW_COUNT; i++) {
            const node = elTemplate() as HTMLElement;
            renderEffect(() => setAttr(node, 'data-active', state.active ? 'yes' : 'no'));
            insertBlock(node, container);
        }

        for (let iter = 0; iter < UPDATE_ITERATIONS; iter++) {
            state.active = !state.active;
        }
    });

    bench('vdom', () => {
        const container = document.createElement('div');
        let active = false;

        const buildTree = (a: boolean): VNode =>
            h(
                'div',
                {},
                '',
                Array.from({ length: ROW_COUNT }, () =>
                    h('div', { 'data-active': a ? 'yes' : 'no' }, '')
                )
            );

        let oldTree = buildTree(active);
        container.appendChild(mountVNode(oldTree));

        for (let iter = 0; iter < UPDATE_ITERATIONS; iter++) {
            active = !active;
            const newTree = buildTree(active);
            patchVNode(oldTree, newTree);
            oldTree = newTree;
        }
    });
});
