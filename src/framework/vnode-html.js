// @flow

import mounter from "./mounter.js";
import patcher from "./patcher.js";
import dismounter from "./dismounter.js";

import {
    createElement,
    releaseNode,
    updateAttr,
} from "aura-dom";

import vnode, {
    getElementDomNode,
} from "./vnode.js";

function createCtor(tagName: string): Class {
    // instances of this class will never be exposed to user-land
    return class HTML extends vnode {

        constructor(attrs: Object, body: array<Object>) {
            super();
            this.domNode = createElement(tagName);
            this.bodyMap = new Map();
            // TODO: keep track of tagName-s that can have body
            this.hasBodyAttribute = true;
            this.attrs = attrs;
            this.body = body;
        }

        set(attrName: string, attrValue: any) {
            if (attrName === 'body') {
                this.body = attrValue;
                this.mountBody();
            }
            this.attrs[attrName] = attrValue;
            updateAttr(this.domNode, attrName, attrValue);
        }

        toBeDismount() {
            super.toBeDismount();
            releaseNode(this.domNode);
        }

        toBeMounted() {
            super.toBeMounted();
            const { domNode, attrs } = this;
            // this is possible because events can't be binding... they are set once
            // while the handler can deal with any provider updates, not here in the dom
            for (let [attrName, attrValue] of Object.entries(attrs)) {
                updateAttr(domNode, attrName, attrValue);
            }
            this.mountBody();
        }

        toBeHydrated() {
            // nothing to be done here... :)
        }

        // TODO: This is problably the most important method of all...
        mountBody() {
            const { body, bodyMap, domNode } = this;
            const condemned = new Set(bodyMap.values());
            const newMap = new Map();
            const childNodes = [...domNode.childNodes];
            let len = body.length;
            let i = 0;
            for (i; i < len; i += 1) {
                const oldDomNode = childNodes[i] || null;
                let newElement = body[i];
                const index = newElement.key || '>' + i;
                const reflectiveElement = bodyMap.get(index);
                let reflectiveDomNode;
                if (reflectiveElement) {
                    condemned.delete(reflectiveElement);
                    reflectiveDomNode = getElementDomNode(reflectiveElement);
                    // I found the best match
                    newElement = patcher(reflectiveElement, newElement);
                } else {
                    mounter(newElement);
                }
                newMap.set(index, newElement);
                // todo: this need to be reworked...
                let newDomNode = getElementDomNode(newElement);
                if (newDomNode !== oldDomNode) {
                    if (oldDomNode) {
                        oldDomNode.parentNode.insertBefore(newDomNode, oldDomNode);
                    } else {
                        domNode.appendChild(newDomNode);
                    }
                    if (reflectiveDomNode && reflectiveDomNode !== newDomNode) {
                        reflectiveDomNode.parentNode.removeChild(reflectiveDomNode);
                    }
                }
            }
            // dismounting the rest
            for (let elementToBeDismounted of condemned) {
                dismounter(elementToBeDismounted);
            }
            this.bodyMap = newMap;
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
