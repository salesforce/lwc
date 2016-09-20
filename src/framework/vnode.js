// @flow

import {
    assertElement,
    assert,
} from "./utils.js";

export default class vnode {
    hasBodyAttribute = false;
    isReady = false;
    isScheduled = false;
    isMounted = false;
    domNode = null;

    set(attrName: string, attrValue: any) {
        assert(false, 'Abstract Method set() invoked.');
    }

    toBeHydrated() {
        assert(false, 'Abstract Method toBeHydrated() invoked.');
    }

    toBeMounted() {
        this.isMounted = true;
    }

    toBeDismount() {
        this.isMounted = false;
    }

    toString(): string {
        const type = Object.getPrototypeOf(this).constructor.vnodeType;
        return `<${type}>`;
    }

}

export function getElementDomNode(element: Object): Node {
    assertElement(element);
    return element.vnode.domNode;
}

export function scheduleRehydration(vnode: Object) {
    if (!vnode.isScheduled && vnode.isReady) {
        vnode.isScheduled = true;
        Promise.resolve().then((): any => {
            vnode.toBeHydrated();
        });
    }
}
