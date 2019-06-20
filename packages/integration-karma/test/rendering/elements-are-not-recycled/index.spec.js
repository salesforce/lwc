import { createElement } from 'lwc';
import Container from 'x/container';

it('should not have have an error re-rendering slotted content', function() {
    const elm = createElement('x-container', { is: Container });
    document.body.appendChild(elm);

    const child = elm.shadowRoot.querySelector('x-child');
    // x-child show/hides the slotted content
    // Note: There is a difference between native and synthetic shadow on how they handle slotted content:
    // In native shadow: xSimple will be present and connected, but when not visible, is because dont have any assignedSlot.
    // In the synthetic shadow however, xSimple will be null and not present in the DOM when not rendered.

    return Promise.resolve()
        .then(() => {
            child.open = true;

            return Promise.resolve();
        })
        .then(() => {
            const xSimple = elm.shadowRoot.querySelector('x-simple');

            expect(xSimple).not.toBeNull();
            expect(xSimple.assignedSlot).not.toBeNull();

            child.open = false;

            return Promise.resolve();
        })
        .then(() => {
            const xSimple = elm.shadowRoot.querySelector('x-simple');

            expect(xSimple === null || xSimple.assignedSlot === null).toBeTruthy();
            child.open = true;

            return Promise.resolve();
        })
        .then(() => {
            const xSimple = elm.shadowRoot.querySelector('x-simple');

            expect(xSimple).not.toBeNull();
            expect(xSimple.assignedSlot).not.toBeNull();
        });
});
