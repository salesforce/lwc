// @flow

import assert from "./assert.js";

export function dismount(element: Object) {
    assert.element(element);
    const { vnode } = element;
    if (!vnode.isMounted) {
        assert.fail(`Component element ${vnode} must be mounted.`);
    }
    console.log(`Dismounting ${vnode}`);
    vnode.toBeDismount();
    assert.isFalse(vnode.isMounted, `Failed to dismount element ${vnode}.`);
}

export function dismountElements(elements: array<Object>) {
    const condemned = new Set(elements);
    for (let elementToBeDismounted of condemned) {
        dismount(elementToBeDismounted);
    }
}
