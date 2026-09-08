/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, it, expect, vi } from 'vitest';
import { applyScopeTokenToStaticFragment } from '../modules/static-parts';
import type { RendererAPI } from '../renderer';

// Minimal fake DOM node used to drive the renderer-mediated walk. Elements carry a `classList`
// with an `add` spy; text nodes carry no classList so we can assert they're skipped.
interface FakeNode {
    nodeType: number;
    firstChild: FakeNode | null;
    nextSibling: FakeNode | null;
    parentNode: FakeNode | null;
    classList?: { add: ReturnType<typeof vi.fn> };
    setAttr?: ReturnType<typeof vi.fn>;
}

function el(): FakeNode {
    return {
        nodeType: 1,
        firstChild: null,
        nextSibling: null,
        parentNode: null,
        classList: { add: vi.fn() },
        setAttr: vi.fn(),
    };
}

function text(): FakeNode {
    return {
        nodeType: 3,
        firstChild: null,
        nextSibling: null,
        parentNode: null,
        // No classList/setAttr — if the walk ever calls these on a text node it will throw.
    };
}

// Wire up parent/child/sibling links: `parent` gets `children` in order.
function link(parent: FakeNode, children: FakeNode[]) {
    parent.firstChild = children[0] ?? null;
    for (let i = 0; i < children.length; i++) {
        children[i].parentNode = parent;
        children[i].nextSibling = children[i + 1] ?? null;
    }
}

// A renderer whose traversal + mutation primitives read/write our fake nodes. `setAttribute`
// records onto the target node's own spy so we can assert per-element.
function mockRenderer(): RendererAPI {
    return {
        getFirstChild: (n: FakeNode) => n.firstChild,
        nextSibling: (n: FakeNode) => n.nextSibling,
        getParentNode: (n: FakeNode) => n.parentNode,
        getProperty: (n: FakeNode, key: string) => (n as any)[key],
        getClassList: (n: FakeNode) => n.classList as any,
        setAttribute: (n: FakeNode, name: string, value: string) => {
            (n.setAttr as any)(name, value);
        },
    } as unknown as RendererAPI;
}

// Build the tree used by most tests:
//   root(el) -> [a(el) -> [t(text)], b(el)]
// Elements: root, a, b (3). Text: t (must be skipped).
function buildTree() {
    const root = el();
    const a = el();
    const b = el();
    const t = text();
    link(root, [a, b]);
    link(a, [t]);
    return { root, a, b, t };
}

const TOKEN = 'lwc-6k2b9pjf8kn';

describe('applyScopeTokenToStaticFragment', () => {
    it('adds the scope token as a class to every element (scoped styles only)', () => {
        const { root, a, b, t } = buildTree();
        applyScopeTokenToStaticFragment(
            root as any,
            TOKEN,
            /* hasScopedStyles */ true,
            /* isSyntheticShadow */ false,
            mockRenderer()
        );

        for (const node of [root, a, b]) {
            expect(node.classList!.add).toHaveBeenCalledTimes(1);
            expect(node.classList!.add).toHaveBeenCalledWith(TOKEN);
            // No bare attribute when only scoped styles apply.
            expect(node.setAttr).not.toHaveBeenCalled();
        }
        // The text node is skipped entirely (it has no classList/setAttr to call).
        expect(t.classList).toBeUndefined();
    });

    it('sets the real bare token attribute on every element (synthetic shadow only)', () => {
        const { root, a, b } = buildTree();
        applyScopeTokenToStaticFragment(
            root as any,
            TOKEN,
            /* hasScopedStyles */ false,
            /* isSyntheticShadow */ true,
            mockRenderer()
        );

        for (const node of [root, a, b]) {
            // Bare attribute — empty value — is what cloneNode(deep) will copy per mount.
            expect(node.setAttr).toHaveBeenCalledTimes(1);
            expect(node.setAttr).toHaveBeenCalledWith(TOKEN, '');
            // No class when only synthetic-shadow scoping applies.
            expect(node.classList!.add).not.toHaveBeenCalled();
        }
    });

    it('applies both the class and the bare attribute when both modes apply', () => {
        const { root, a, b } = buildTree();
        applyScopeTokenToStaticFragment(
            root as any,
            TOKEN,
            /* hasScopedStyles */ true,
            /* isSyntheticShadow */ true,
            mockRenderer()
        );

        for (const node of [root, a, b]) {
            expect(node.classList!.add).toHaveBeenCalledWith(TOKEN);
            expect(node.setAttr).toHaveBeenCalledWith(TOKEN, '');
        }
    });

    it('never touches non-element (text/comment) nodes', () => {
        // A tree that is a single element with two text children and a nested element.
        const root = el();
        const t1 = text();
        const inner = el();
        const t2 = text();
        link(root, [t1, inner, t2]);
        // Give the text nodes classList/setAttr spies so we can prove they're not called.
        const spy = vi.fn();
        (t1 as any).classList = { add: spy };
        (t2 as any).classList = { add: spy };
        (t1 as any).setAttr = spy;
        (t2 as any).setAttr = spy;

        applyScopeTokenToStaticFragment(root as any, TOKEN, true, true, mockRenderer());

        expect(spy).not.toHaveBeenCalled();
        expect(root.classList!.add).toHaveBeenCalledWith(TOKEN);
        expect(inner.classList!.add).toHaveBeenCalledWith(TOKEN);
    });

    it('handles a single root element with no children', () => {
        const root = el();
        applyScopeTokenToStaticFragment(root as any, TOKEN, true, true, mockRenderer());
        expect(root.classList!.add).toHaveBeenCalledWith(TOKEN);
        expect(root.setAttr).toHaveBeenCalledWith(TOKEN, '');
    });

    it('walks a deep chain without revisiting or escaping the root subtree', () => {
        // root -> a -> b -> c (each a single-child element)
        const root = el();
        const a = el();
        const b = el();
        const c = el();
        link(root, [a]);
        link(a, [b]);
        link(b, [c]);

        applyScopeTokenToStaticFragment(root as any, TOKEN, true, false, mockRenderer());

        for (const node of [root, a, b, c]) {
            expect(node.classList!.add).toHaveBeenCalledTimes(1);
        }
    });
});
