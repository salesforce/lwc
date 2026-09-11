/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, test, expect } from 'vitest';
import { createIf } from '../createIf';
import { createFor } from '../createFor';
import { createReactiveProxy } from '../reactivity';
import { insertBlock } from '../block';
import { template } from '../dom/template';

describe('createIf', () => {
    test('renders positive branch when condition is true', () => {
        const state = createReactiveProxy({ show: true });
        const container = document.createElement('div');
        const t0 = template('<span>visible</span>');

        const block = createIf(
            () => state.show,
            () => t0()
        );

        insertBlock(block, container);
        expect(container.innerHTML).toContain('visible');
    });

    test('renders nothing when condition is false and no negative branch', () => {
        const state = createReactiveProxy({ show: false });
        const container = document.createElement('div');
        const t0 = template('<span>visible</span>');

        const block = createIf(
            () => state.show,
            () => t0()
        );

        insertBlock(block, container);
        expect(container.querySelector('span')).toBeNull();
    });

    test('renders negative branch when condition is false', () => {
        const state = createReactiveProxy({ show: false });
        const container = document.createElement('div');
        const t0 = template('<span>yes</span>');
        const t1 = template('<span>no</span>');

        const block = createIf(
            () => state.show,
            () => t0(),
            () => t1()
        );

        insertBlock(block, container);
        expect(container.innerHTML).toContain('no');
        expect(container.innerHTML).not.toContain('yes');
    });

    test('switches branches reactively', () => {
        const state = createReactiveProxy({ show: true });
        const container = document.createElement('div');
        const t0 = template('<span>yes</span>');
        const t1 = template('<span>no</span>');

        const block = createIf(
            () => state.show,
            () => t0(),
            () => t1()
        );

        insertBlock(block, container);
        expect(container.innerHTML).toContain('yes');

        state.show = false;
        expect(container.innerHTML).toContain('no');
        expect(container.innerHTML).not.toContain('yes');

        state.show = true;
        expect(container.innerHTML).toContain('yes');
    });
});

describe('createFor', () => {
    test('renders list items', () => {
        const state = createReactiveProxy({ items: ['a', 'b', 'c'] });
        const container = document.createElement('div');

        const block = createFor(
            () => state.items,
            (item: string) => {
                const el = document.createElement('span');
                el.textContent = item;
                return el;
            }
        );

        insertBlock(block, container);
        const spans = container.querySelectorAll('span');
        expect(spans.length).toBe(3);
        expect(spans[0].textContent).toBe('a');
        expect(spans[1].textContent).toBe('b');
        expect(spans[2].textContent).toBe('c');
    });

    test('renders empty list', () => {
        const state = createReactiveProxy({ items: [] as string[] });
        const container = document.createElement('div');

        const block = createFor(
            () => state.items,
            (item: string) => {
                const el = document.createElement('span');
                el.textContent = item;
                return el;
            }
        );

        insertBlock(block, container);
        expect(container.querySelectorAll('span').length).toBe(0);
    });

    test('adds new items reactively', () => {
        const state = createReactiveProxy({ items: ['a', 'b'] });
        const container = document.createElement('div');

        const block = createFor(
            () => state.items,
            (item: string) => {
                const el = document.createElement('span');
                el.textContent = item;
                return el;
            }
        );

        insertBlock(block, container);
        expect(container.querySelectorAll('span').length).toBe(2);

        state.items = ['a', 'b', 'c'];
        expect(container.querySelectorAll('span').length).toBe(3);
    });
});
