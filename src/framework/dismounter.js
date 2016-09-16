// @flow

import {
    assert,
    assertElement,
    log,
} from "./utils.js";

export default function dismounter(oldElement: Object) {
    assertElement(oldElement);
    const { vnode } = oldElement;
    if (!vnode.isMounted) {
        throw new Error(`Assert: Component element ${vnode} must be mounted.`);
    }
    DEVELOPMENT && log(`Dismounting ${vnode}`);
    vnode.toBeDismount();
    assert(vnode.isMounted === false, `Failed to dismount element ${vnode}.`);
}
