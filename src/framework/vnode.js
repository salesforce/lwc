// @flow

import {
    assertElement,
    assert,
} from "./utils.js";

export default class vnode {

    constructor() {
        this.hasBodyAttribute = false;
        this.isMounted = false;
        this.domNode = null;
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

    toString(): string {
        const type = Object.getPrototypeOf(this).constructor.vnodeType;
        return `<${type}>`;
    }

}

export function getElementDomNode(element: Object): Node {
    assertElement(element);
    return element.vnode.domNode;
}
