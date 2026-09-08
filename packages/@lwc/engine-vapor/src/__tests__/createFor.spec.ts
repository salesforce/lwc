/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, test, expect } from 'vitest';
import { createFor } from '../createFor';
import { template } from '../dom/template';
import { child } from '../dom/node';
import { setText } from '../dom/prop';
import { renderEffect } from '../renderEffect';
import { insertBlock } from '../block';
import { createReactiveProxy } from '../reactivity';

function mountList(state: { items: any[] }): HTMLElement {
    const container = document.createElement('div');
    const liTemplate = template('<li> </li>');
    const frag = createFor(
        () => state.items,
        (item: any) => {
            const li = liTemplate() as HTMLElement;
            const textNode = child(li);
            renderEffect(() => setText(textNode as Text, item.name));
            return li;
        },
        (item: any) => item.id
    );
    insertBlock(frag, container);
    return container;
}

const items = (...names: string[]) => names.map((name, i) => ({ id: i + 1, name }));

describe('createFor', () => {
    test('renders initial items', () => {
        const state = createReactiveProxy({ items: items('a', 'b', 'c') });
        const c = mountList(state);
        expect([...c.querySelectorAll('li')].map((li) => li.textContent)).toEqual(['a', 'b', 'c']);
    });

    test('grows the list', () => {
        const state = createReactiveProxy({ items: items('a') });
        const c = mountList(state);
        state.items = items('a', 'b', 'c');
        expect([...c.querySelectorAll('li')].map((li) => li.textContent)).toEqual(['a', 'b', 'c']);
    });

    test('shrinks the list', () => {
        const state = createReactiveProxy({ items: items('a', 'b', 'c') });
        const c = mountList(state);
        state.items = items('a');
        expect([...c.querySelectorAll('li')].map((li) => li.textContent)).toEqual(['a']);
    });

    test('updates item content when data at a key changes', () => {
        const state = createReactiveProxy({ items: [{ id: 1, name: 'a' }] });
        const c = mountList(state);
        state.items = [{ id: 1, name: 'A' }];
        expect(c.querySelector('li')!.textContent).toBe('A');
    });
});
