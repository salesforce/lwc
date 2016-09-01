// @flow

import mounter from "./mounter.js";

import {
    createElement,
    releaseNode,
    updateAttr,
} from "aura-dom";

function mountChildren(domNode: Node, refs: array<Object>) {
    const len = refs.length;
    let i = 0;
    for (i; i < len; i += 1) {
        const tree = mounter(refs[i]);
        domNode.appendChild(tree);
    }
}

import vnode from "./vnode.js";

function createCtor(tagName: string): Class {
    // instances of this class will never be exposed to user-land
    return class vnodeHTML extends vnode {

        constructor(attrs: Object, childRefs: array<Object>) {
            super();
            this.events = Object.create(null);
            this.domNode = createElement(tagName);
            // this is possible because events can't be binding... they are set once
            // while the handler can deal with any provider updates, not here in the dom
            for (let [attrName, attrValue] of Object.entries(attrs)) {
                updateAttr(this.domNode, attrName, attrValue);
            }
            mountChildren(this.domNode, childRefs);
        }

        set(attrName: string, attrValue: any) {
            // TODO: we might want to batch these changes
            updateAttr(this.domNode, attrName, attrValue);
        }

        toBeDismount() {
            super.toBeDismount();
            releaseNode(this.domNode);
        }

        toBeMounted() {
            super.toBeMounted();
            for (let attrName in this.events) {
                updateAttr(this.domNode, attrName, this.events[attrName]);
            }
        }

    }
}

const tagCtor = {};

export function factory(tagName: string): Object {
    let Ctor = tagCtor[tagName];
    if (!Ctor) {
        Ctor = createCtor(tagName);
        tagCtor[tagName] = Ctor;
    }
    return Ctor;
}
