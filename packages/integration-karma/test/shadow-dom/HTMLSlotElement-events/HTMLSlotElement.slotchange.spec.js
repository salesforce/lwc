import { createElement } from 'test-utils';

import Parent from 'x/parent';

let elm;
let child;

beforeEach(() => {
    elm = createElement('x-parent', { is: Parent });
    document.body.appendChild(elm);
    child = elm.shadowRoot.querySelector('x-child');
});

it('should fire slotchange on initial render', () => {
    return Promise.resolve().then(() => {
        expect(child.slotChangeCount).toBe(1);
    });
});

it('should fire non-composed slotchange', () => {
    return Promise.resolve().then(() => {
        expect(elm.slotChangeCount).toBe(0);
    });
});

it('should fire slotchange on add', () => {
    elm.add();
    // Macrotask because need to wait for rehydrate + MO callback
    return new Promise(setTimeout).then(() => {
        expect(child.slotChangeCount).toBe(2);
    });
});

it('should fire slotchange on remove', () => {
    elm.clear();
    // Macrotask because need to wait for rehydrate + MO callback
    return new Promise(setTimeout).then(() => {
        expect(child.slotChangeCount).toBe(2);
    });
});

it('should fire slotchange on replace', () => {
    elm.replace();
    // Macrotask because need to wait for rehydrate + MO callback
    return new Promise(setTimeout).then(() => {
        expect(child.slotChangeCount).toBe(2);
    });
});

it('should fire slotchange when listener added programmatically', done => {
    let count = 0;
    return (
        Promise.resolve()
            // Macrotask because need to wait for initial render
            .then(setTimeout)
            .then(() => {
                child.shadowRoot.querySelector('slot').addEventListener('slotchange', () => {
                    count += 1;
                });
                elm.add();
            })
            // Macrotask because need to wait for rehydrate + MO callback
            .then(setTimeout)
            .then(() => {
                expect(count).toBe(1);
            })
            .then(done)
    );
});
