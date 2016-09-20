// @flow

import vnode from "./vnode.js";
import { assert } from "./utils.js";

export default class Text extends vnode {

    static vnodeType = 'textNode';

    constructor(attrs: Object) {
        super();
        this.domNode = document.createTextNode(attrs.textContent);
        this.isReady = true;
    }

    set(attrName: string, attrValue: any) {
        if (attrName === 'textContent') {
            // TODO: move this operation into dom ops
            this.domNode.textContent = attrValue || '';
            return;
        }
        assert(false, `Invariant: textNode element does not support attribute ${attrName}.`);
    }

}
