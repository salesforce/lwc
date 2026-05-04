/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, test, expect, vi, afterEach } from 'vitest';
import { renderer } from '../renderer';
import {
    HostAttributesKey,
    HostChildrenKey,
    HostNamespaceKey,
    HostNodeType,
    HostParentKey,
    HostTypeKey,
    HostValueKey,
} from '../types';
import type { HostText } from '../types';

describe('renderer', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('insert', () => {
        test('appends node to parent when no anchor is provided', () => {
            const parent = renderer.createElement('div');
            const child = renderer.createText('hello');

            renderer.insert(child, parent, null);

            expect(parent[HostChildrenKey]).toEqual([child]);
            expect(child[HostParentKey]).toBe(parent);
        });

        test('inserts node at anchor position', () => {
            const parent = renderer.createElement('div');
            const first = renderer.createText('first');
            const anchor = renderer.createText('anchor');
            const inserted = renderer.createText('inserted');
            renderer.insert(first, parent, null);
            renderer.insert(anchor, parent, null);

            renderer.insert(inserted, parent, anchor);

            expect(parent[HostChildrenKey]).toEqual([first, inserted, anchor]);
        });

        test('removes node from previous parent when moved to a new parent', () => {
            const oldParent = renderer.createElement('div');
            const newParent = renderer.createElement('div');
            const child = renderer.createText('child');
            renderer.insert(child, oldParent, null);

            renderer.insert(child, newParent, null);

            expect(oldParent[HostChildrenKey]).toEqual([]);
            expect(newParent[HostChildrenKey]).toEqual([child]);
            expect(child[HostParentKey]).toBe(newParent);
        });

        test('appends to parent when anchor is not a child of that parent', () => {
            const parent = renderer.createElement('div');
            const orphanAnchor = renderer.createText('orphan');
            const child = renderer.createText('child');

            renderer.insert(child, parent, orphanAnchor);

            expect(parent[HostChildrenKey]).toEqual([child]);
        });
    });

    describe('remove', () => {
        test('removes a node from its parent children array', () => {
            const parent = renderer.createElement('div');
            const a = renderer.createText('a');
            const b = renderer.createText('b');
            renderer.insert(a, parent, null);
            renderer.insert(b, parent, null);

            renderer.remove(b, parent);

            expect(parent[HostChildrenKey]).toEqual([a]);
        });
    });

    describe('cloneNode', () => {
        test('clones a Raw node', () => {
            const raw = renderer.createFragment('<p>hi</p>');

            const clone = renderer.cloneNode(raw);

            expect(clone).not.toBe(raw);
            if (clone[HostTypeKey] !== HostNodeType.Raw) {
                throw new Error('expected clone to be a Raw node');
            }
            expect(clone[HostValueKey]).toBe('<p>hi</p>');
        });

        test('throws when given a non-Raw node in development', () => {
            vi.stubEnv('NODE_ENV', 'development');
            try {
                const text = renderer.createText('nope');

                expect(() => renderer.cloneNode(text)).toThrow(
                    /cloneNode was called with invalid NodeType/
                );
            } finally {
                vi.unstubAllEnvs();
            }
        });

        test('does not throw when given a non-Raw node in production', () => {
            vi.stubEnv('NODE_ENV', 'production');
            try {
                const text = renderer.createText('nope');

                expect(() => renderer.cloneNode(text)).not.toThrow();
            } finally {
                vi.unstubAllEnvs();
            }
        });
    });

    describe('getSibling traversal', () => {
        test('returns null when node has no parent', () => {
            const orphan = renderer.createText('orphan');

            expect(renderer.nextSibling(orphan)).toBeNull();
            expect(renderer.previousSibling(orphan)).toBeNull();
        });

        test('returns the next and previous siblings when parent exists', () => {
            const parent = renderer.createElement('div');
            const a = renderer.createText('a');
            const b = renderer.createText('b');
            const c = renderer.createText('c');
            renderer.insert(a, parent, null);
            renderer.insert(b, parent, null);
            renderer.insert(c, parent, null);

            expect(renderer.nextSibling(b)).toBe(c);
            expect(renderer.previousSibling(b)).toBe(a);
            expect(renderer.nextSibling(c)).toBeNull();
            expect(renderer.previousSibling(a)).toBeNull();
        });
    });

    describe('getProperty', () => {
        test('returns own properties directly when present on the node', () => {
            const el = renderer.createElement('span');

            expect(renderer.getProperty(el, 'tagName')).toBe('span');
        });

        test('returns boolean attribute values, defaulting to false', () => {
            const input = renderer.createElement('input');

            expect(renderer.getProperty(input, 'hidden')).toBe(false);

            renderer.setAttribute(input, 'hidden', '');
            expect(renderer.getProperty(input, 'hidden')).toBe('');
        });

        test('returns global reflective attributes', () => {
            const el = renderer.createElement('div');
            renderer.setAttribute(el, 'id', 'main');

            expect(renderer.getProperty(el, 'id')).toBe('main');
        });

        test('returns ARIA attributes', () => {
            const el = renderer.createElement('div');
            renderer.setAttribute(el, 'aria-label', 'close');

            expect(renderer.getProperty(el, 'ariaLabel')).toBe('close');
        });

        test('returns the input value live binding, defaulting to empty string', () => {
            const input = renderer.createElement('input');

            expect(renderer.getProperty(input, 'value')).toBe('');

            renderer.setAttribute(input, 'value', 'hi');
            expect(renderer.getProperty(input, 'value')).toBe('hi');
        });

        test('logs an error in development for unexpected property access', () => {
            vi.stubEnv('NODE_ENV', 'development');
            try {
                const el = renderer.createElement('div');
                const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

                const result = renderer.getProperty(el, 'notARealProp');

                expect(result).toBeUndefined();
                expect(spy).toHaveBeenCalledWith(
                    expect.stringContaining('Unexpected "notARealProp" property access')
                );

                spy.mockRestore();
            } finally {
                vi.unstubAllEnvs();
            }
        });
    });

    describe('setText', () => {
        test('updates the value of a text node in place', () => {
            const text = renderer.createText('before') as HostText;

            renderer.setText(text, 'after');

            expect(text[HostValueKey]).toBe('after');
        });

        test('replaces element children with a single text node', () => {
            const el = renderer.createElement('div');
            renderer.insert(renderer.createText('old'), el, null);

            renderer.setText(el, 'fresh');

            expect(el[HostChildrenKey]).toHaveLength(1);
            const [child] = el[HostChildrenKey];
            if (child[HostTypeKey] !== HostNodeType.Text) {
                throw new Error('expected child to be a Text node');
            }
            expect(child[HostValueKey]).toBe('fresh');
            expect(child[HostParentKey]).toBe(el);
        });
    });

    describe('setAttribute', () => {
        test('coerces undefined namespace to null when storing', () => {
            const el = renderer.createElement('div');

            renderer.setAttribute(el, 'data-x', '1', undefined);

            expect(el[HostAttributesKey]).toHaveLength(1);
            expect(el[HostAttributesKey][0][HostNamespaceKey]).toBeNull();
            expect(el[HostAttributesKey][0].value).toBe('1');
        });

        test('updates an existing attribute in place', () => {
            const el = renderer.createElement('div');
            renderer.setAttribute(el, 'data-x', 'first');

            renderer.setAttribute(el, 'data-x', 'second');

            expect(el[HostAttributesKey]).toHaveLength(1);
            expect(el[HostAttributesKey][0].value).toBe('second');
        });
    });
});
