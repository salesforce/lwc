// @flow

import vnode from "./vnode.js";
import { assert } from "./utils.js";

export default class Text extends vnode {

    static vnodeType = 'textNode';

    constructor(attrs: Object) {
        super();
        this.domNode = document.createTextNode(attrs.textContent);
    }

    set(attrName: string, attrValue: any) {
        if (attrName === 'textContent') {
            // TODO: move this operation into dom ops
            this.domNode.textContent = attrValue || '';
            return;
        }
        assert(false, `textNode element does not support ${attrName} attribute.`);
    }

}
