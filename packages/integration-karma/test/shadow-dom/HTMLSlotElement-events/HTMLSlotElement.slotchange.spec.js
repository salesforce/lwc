import { createElement } from 'test-utils';

import Parent from 'x/parent';

let elm;
let onDiv;
let onSlot;
let nested;

beforeEach(() => {
    elm = createElement('x-parent', { is: Parent });
    document.body.appendChild(elm);
    onDiv = elm.shadowRoot.querySelector('x-slotchange-on-div');
    onSlot = elm.shadowRoot.querySelector('x-slotchange-on-slot');
    nested = elm.shadowRoot.querySelector('x-nested-slots');
});

describe('when slotchange listener on slot', () => {
    it('should fire slotchange on initial render', () => {
        return Promise.resolve().then(() => {
            expect(onSlot.slotChangeCount).toBe(1);
        });
    });

    it('should fire non-bubbling slotchange', () => {
        return Promise.resolve().then(() => {
            expect(onSlot.bubblingSlotChangeCount).toBe(0);
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
            expect(onSlot.slotChangeCount).toBe(2);
        });
    });

    it('should fire slotchange on remove', () => {
        elm.clear();
        // Macrotask because need to wait for rehydrate + MO callback
        return new Promise(setTimeout).then(() => {
            expect(onSlot.slotChangeCount).toBe(2);
        });
    });

    it('should fire slotchange on replace', () => {
        elm.replace();
        // Macrotask because need to wait for rehydrate + MO callback
        return new Promise(setTimeout).then(() => {
            expect(onSlot.slotChangeCount).toBe(2);
        });
    });

    it('should not fire slotchange on parent slot when child slot content updates', () => {
        elm.customizeLastName = true;
        // Macrotask because need to wait for rehydrate + MO callback
        return new Promise(setTimeout).then(() => {
            expect(nested.slotChangeCount).toBe(1);
        });
    });
});

describe('when slotchange listener on div (slot ancestor)', () => {
    it('should not fire slotchange on initial render', () => {
        return Promise.resolve().then(() => {
            expect(onDiv.slotChangeCount).toBe(0);
        });
    });

    it('should fire slotchange when listener added programmatically', () => {
        let count = 0;
        onDiv.shadowRoot.querySelector('slot').addEventListener('slotchange', () => {
            count += 1;
        });
        elm.add();

        // Macrotask because need to wait for rehydrate + MO callback
        return new Promise(setTimeout).then(() => {
            expect(count).toBe(1);
        });
    });
});
