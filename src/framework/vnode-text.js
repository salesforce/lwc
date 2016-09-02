// @flow

import vnode from "./vnode.js";
import { updateText } from "aura-dom";
import { assert } from "./utils.js";

export default class Text extends vnode {

    constructor(attrs: Object) {
        super();
        this.textContent = attrs.textContext;
        this.domNode = document.createTextNode(attrs.textContent);
    }

    set(attrName: string, attrValue: any) {
        if (attrName === 'textContent') {
            const { domNode } = this;
            this.textContent = attrValue;
            updateText(domNode, attrValue);
        }
        assert(false, `textNode element does not support ${attrName} attribute.`);
    }

}
