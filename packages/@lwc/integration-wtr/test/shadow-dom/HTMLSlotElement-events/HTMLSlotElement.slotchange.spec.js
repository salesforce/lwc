import { createElement } from 'lwc';

import Parent from 'x/parent';

// Macro-task timing is used because MutationObserver used in
// slotchange implementation is not exactly micro-task timing.
function waitForSlotChange() {
    return new Promise(setTimeout);
}

let parent;
let child;

beforeEach(async () => {
    parent = createElement('x-parent', { is: Parent });
    document.body.appendChild(parent);
    child = parent.shadowRoot.querySelector('x-child');

    await waitForSlotChange();
});

it('should fire slotchange on initial render', () => {
    expect(child.getSlotChangeCount()).toBe(1);
});

it('should fire non-composed slotchange', () => {
    expect(parent.getSlotChangeCount()).toBe(0);
});

it('should fire slotchange on add', async () => {
    child.setSlotChangeCount(0);
    parent.add();

    await waitForSlotChange();
    expect(child.getSlotChangeCount()).toBe(1);
});

it('should fire slotchange on remove', async () => {
    child.setSlotChangeCount(0);
    parent.clear();

    await waitForSlotChange();
    expect(child.getSlotChangeCount()).toBe(1);
});

it('should fire slotchange on replace', async () => {
    child.setSlotChangeCount(0);
    parent.replace();

    await waitForSlotChange();
    expect(child.getSlotChangeCount()).toBe(1);
});

it('should fire slotchange when slot is removed', async () => {
    child.setSlotChangeCount(0);
    child.removeSlot();

    await waitForSlotChange();
    expect(child.getSlotChangeCount()).toBe(1);
});

it('should fire slotchange when listener added programmatically', async () => {
    let count = 0;

    child.shadowRoot.querySelector('slot').addEventListener('slotchange', () => {
        count += 1;
    });

    parent.add();

    await waitForSlotChange();
    expect(count).toBe(1);
});
