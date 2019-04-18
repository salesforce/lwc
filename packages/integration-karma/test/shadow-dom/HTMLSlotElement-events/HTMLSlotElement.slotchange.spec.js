import { createElement } from 'test-utils';

import Parent from 'x/parent';

let parent;
let child;

// These tests use task timing instead of the microtask timing to schedule
// assertions due to MO timing inconsistency across browsers.

beforeEach(() => {
    parent = createElement('x-parent', { is: Parent });
    document.body.appendChild(parent);
    child = parent.shadowRoot.querySelector('x-child');
});

it('should fire non-composed slotchange', () => {
    return Promise.resolve()
        .then(setTimeout)
        .then(() => {
            expect(parent.getCount()).toBe(0);
        });
});

it('should fire slotchange on add', () => {
    return Promise.resolve()
        .then(setTimeout)
        .then(() => {
            child.setCount(0);
            parent.add();
        })
        .then(setTimeout)
        .then(() => {
            expect(child.getCount()).toBe(1);
        });
});

it('should fire slotchange on remove', () => {
    return Promise.resolve()
        .then(setTimeout)
        .then(() => {
            child.setCount(0);
            parent.clear();
        })
        .then(setTimeout)
        .then(() => {
            expect(child.getCount()).toBe(1);
        });
});

it('should fire slotchange on replace', () => {
    return Promise.resolve()
        .then(setTimeout)
        .then(() => {
            child.setCount(0);
            parent.replace();
        })
        .then(setTimeout)
        .then(() => {
            expect(child.getCount()).toBe(1);
        });
});

it('should fire slotchange when listener added programmatically', () => {
    let count = 0;
    return Promise.resolve()
        .then(setTimeout)
        .then(() => {
            child.shadowRoot.querySelector('slot').addEventListener('slotchange', () => {
                count += 1;
            });
            parent.add();
        })
        .then(setTimeout)
        .then(() => {
            expect(count).toBe(1);
        });
});
