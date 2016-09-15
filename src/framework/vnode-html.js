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
            this.itemMap = new Map();
            // TODO: keep track of tagName-s that can have body
            this.hasBodyAttribute = true;
            this.attrs = attrs;
            this.body = body;
        }

        set(attrName: string, attrValue: any) {
            if (attrName === 'body') {
                this.body = attrValue;
                this.mountBody();
            } else {
                this.attrs[attrName] = attrValue;
                console.log('Updating: ', this.domNode, attrName, attrValue);
                updateAttr(this.domNode, attrName, attrValue);
            }
        }

        toBeDismount() {
            super.toBeDismount();
            releaseNode(this.domNode);
        }

        toBeMounted() {
            super.toBeMounted();
            const { domNode, attrs } = this;
            const keys = Object.keys(attrs);
            const len = keys.length;
            // this is possible because events can't be binding... they are set once
            // while the handler can deal with any provider updates, not here in the dom
            for (let i = 0; i < len; i += 1) {
                const attrName = keys[i];
                if (attrName !== 'body') {
                    const attrValue = attrs[attrName];
                    console.log('Updating before mounting: ', domNode, attrName, attrValue);
                    updateAttr(domNode, attrName, attrValue);
                }
            }
            this.mountBody();
        }

        toBeHydrated() {
            // nothing to be done here... :)
        }

        findBestMatch(newElement: Object): Object {
            const { bodyMap, itemMap } = this;
            const item = newElement.item;
            const key = newElement.key;
            let reflectiveElementByItem;
            let reflectiveElementByKey;
            if (item && itemMap.has(item)) {
                reflectiveElementByItem = bodyMap.get(item);
            }
            if (bodyMap.has(key)) {
                reflectiveElementByKey = bodyMap.get(key);
            }
            return reflectiveElementByItem || reflectiveElementByKey || null;
        }

        // TODO: This is problably the most important method of all...
        mountBody() {
            const { body, bodyMap, itemMap, domNode } = this;
            const newBodyMap = new Map();
            const newItemMap = new Map();
            const childNodes = [...domNode.childNodes];
            let len = body.length;
            for (let i = 0; i < len; i += 1) {
                let newElement = body[i];
                let reflectiveDomNode;
                const oldDomNodeInIndex = childNodes[i] || null;
                newElement.key = '>' + i;
                const reflectiveElement = this.findBestMatch(newElement);
                if (reflectiveElement) {
                    // if a reflective element is found, we can reuse its vnode
                    // to rehydrate the ui elements
                    bodyMap.delete(reflectiveElement.key);
                    itemMap.delete(reflectiveElement.item);
                    reflectiveDomNode = getElementDomNode(reflectiveElement);
                    newElement = patcher(reflectiveElement, newElement);
                } else {
                    mounter(newElement);
                }
                newBodyMap.set(newElement.key, newElement);
                if (newElement.item) {
                    newItemMap.set(newElement.item, newElement);
                }
                let newDomNode = getElementDomNode(newElement);
                if (newDomNode !== oldDomNodeInIndex) {
                    if (!oldDomNodeInIndex) {
                        domNode.appendChild(newDomNode);
                    } else {
                        domNode.insertBefore(newDomNode, oldDomNodeInIndex);
                    }
                }
                if (reflectiveDomNode && reflectiveDomNode !== newDomNode) {
                    domNode.removeChild(reflectiveDomNode);
                }
            }
            // dismounting the rest of the hanging elements
            const condemned = new Set(bodyMap.values());
            for (let elementToBeDismounted of condemned) {
                const domNode = getElementDomNode(elementToBeDismounted);
                dismounter(elementToBeDismounted);
                domNode.parentNode.removeChild(domNode);
            }
            this.bodyMap = newBodyMap;
            this.itemMap = newItemMap;
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
