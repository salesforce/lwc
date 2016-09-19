// @flow

import {
    assert,
    assertElement,
    log,
} from "./utils.js";

export function dismount(element: Object) {
    assertElement(element);
    const { vnode } = element;
    if (!vnode.isMounted) {
        throw new Error(`Assert: Component element ${vnode} must be mounted.`);
    }
    DEVELOPMENT && log(`Dismounting ${vnode}`);
    vnode.toBeDismount();
    assert(vnode.isMounted === false, `Failed to dismount element ${vnode}.`);
}

export function dismountElements(elements: array<Object>) {
    const condemned = new Set(elements);
    for (let elementToBeDismounted of condemned) {
        dismount(elementToBeDismounted);
    }
}
