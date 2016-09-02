// @flow

import {
    assert,
    assertElement,
} from "./utils.js";

export default function dismounter(oldElement: Object) {
    assertElement(oldElement);
    const { vnode } = oldElement;
    if (!vnode.isMounted) {
        throw new Error(`Assert: Component element ${oldElement} must be mounted.`);
    }
    vnode.toBeDismount();
    assert(vnode.isMounted === false, `Failed to dismount element ${oldElement}.`);
}
