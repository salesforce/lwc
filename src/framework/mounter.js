// @flow

import assert from "./assert.js";
import { patch } from "./patcher.js";
import { createEmptyElement } from "./utils.js";

export function mountToDom(vnode: Object, domNode: Node) {
    assert.vnode(vnode);
    vnode = patch(createEmptyElement(vnode.sel), vnode);
    domNode.innerHTML = '';
    domNode.appendChild(vnode.elm);
}
