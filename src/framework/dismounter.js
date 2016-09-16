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
        DEVELOPMENT && log(`ERROR!!!! Component element ${vnode.name} was already dismounted.`);
        // throw new Error(`Assert: Component element ${vnode.name} must be mounted.`);
    }
    DEVELOPMENT && log(`Dismounting ${vnode.name}`);
    vnode.toBeDismount();
    assert(vnode.isMounted === false, `Failed to dismount element ${oldElement}.`);
}
