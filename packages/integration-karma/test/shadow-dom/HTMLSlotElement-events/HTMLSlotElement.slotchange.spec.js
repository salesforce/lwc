import { createElement } from 'lwc';

import Parent from 'x/parent';

// Macro-task timing is used because MutationObserver used in
// slotchange implementation is not exactly micro-task timing.
function waitForSlotChange() {
    return new Promise(setTimeout);
}

let parent;
let child;

beforeEach(() => {
    parent = createElement('x-parent', { is: Parent });
    document.body.appendChild(parent);
    child = parent.shadowRoot.querySelector('x-child');
});

// TODO [#1282]: This test fails on Safari 12.0.0 but passes locally with 12.1.1 (expected 0 to be 1)
xit('should fire slotchange on initial render', () => {
    return waitForSlotChange().then(() => {
        expect(child.getSlotChangeCount()).toBe(1);
    });
});

it('should fire non-composed slotchange', () => {
    return waitForSlotChange().then(() => {
        expect(parent.getSlotChangeCount()).toBe(0);
    });
});

it('should fire slotchange on add', () => {
    const firedFirstSlotchange = waitForSlotChange();
    const addNewElementToSlot = firedFirstSlotchange.then(() => {
        child.setSlotChangeCount(0);
        parent.add();
    });
    const firedSecondSlotchange = addNewElementToSlot.then(waitForSlotChange);
    return firedSecondSlotchange.then(() => {
        expect(child.getSlotChangeCount()).toBe(1);
    });
});

it('should fire slotchange on remove', () => {
    const firedFirstSlotChange = waitForSlotChange();
    const removeElementsFromSlot = firedFirstSlotChange.then(() => {
        child.setSlotChangeCount(0);
        parent.clear();
    });
    const firedSecondSlotchange = removeElementsFromSlot.then(waitForSlotChange);
    return firedSecondSlotchange.then(() => {
        expect(child.getSlotChangeCount()).toBe(1);
    });
});

it('should fire slotchange on replace', () => {
    const firedFirstSlotChange = waitForSlotChange();
    const replaceElementInSlot = firedFirstSlotChange.then(() => {
        child.setSlotChangeCount(0);
        parent.replace();
    });
    const firedSecondSlotchange = replaceElementInSlot.then(waitForSlotChange);
    return firedSecondSlotchange.then(() => {
        expect(child.getSlotChangeCount()).toBe(1);
    });
});

it('should fire slotchange when listener added programmatically', () => {
    let count = 0;
    const firedFirstSlotChange = waitForSlotChange();
    const addNewElementToSlot = firedFirstSlotChange.then(() => {
        child.shadowRoot.querySelector('slot').addEventListener('slotchange', () => {
            count += 1;
        });
        parent.add();
    });
    return addNewElementToSlot.then(waitForSlotChange).then(() => {
        expect(count).toBe(1);
    });
});
