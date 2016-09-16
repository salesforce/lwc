// @flow

import {
    assertElement,
    assert,
} from "./utils.js";

// instances of this class will never be exposed to user-land
export default class vnode {

    constructor() {
        this.hasBodyAttribute = false;
        this.isMounted = false;
        this.domNode = null;
        this.name = undefined;
    }

    set(attrName: string, attrValue: any) {
        assert(false, 'Abstract Method set() invoked.');
    }

    toBeMounted() {
        this.isMounted = true;
    }

    toBeDismount() {
        this.isMounted = false;
    }

    toBeHydrated() {
        assert(false, 'Abstract Method dispatch() invoked.');
    }

}

export function getElementDomNode(element: Object): Node {
    assertElement(element);
    return element.vnode.domNode;
}
