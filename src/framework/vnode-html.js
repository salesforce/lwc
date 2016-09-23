// @flow

import { patch } from "./patcher.js";
import vnode, {
    getElementDomNode,
    scheduleRehydration,
} from "./vnode.js";
import assert from "./assert.js";
import { mount } from "./mounter.js";
import { dismountElements } from "./dismounter.js";
import { patchChildrenNodes } from "./vdom.js";

import {
    createElement,
    releaseNode,
    updateAttr,
} from "aura-dom";

function createCtor(tagName: string): Class {
    // instances of this class will never be exposed to user-land
    return class HTML extends vnode {
        hasBodyAttribute = false;
        dirtyAttrs = [];
        dirtyBody = false;
        static vnodeType = tagName;

        constructor(attrs: Object, body: array<Object>) {
            super();
            this.attrs = attrs;
            this.body = body;
            this.domNode = createElement(tagName);
            this.bodyMap = new Map();
            this.itemMap = new Map();
            // TODO: keep track of tagName-s that can have body
            this.hasBodyAttribute = true;
            this.isReady = true;
        }

        set(attrName: string, attrValue: any) {
            if (attrName === 'body') {
                this.dirtyBody = true;
                this.body = attrValue;
            } else {
                this.dirtyAttrs.push(attrName);
                this.attrs[attrName] = attrValue;
            }
            scheduleRehydration(this);
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
            const { isMounted, isScheduled } = this;
            if (isMounted) {
                assert.invariant(isScheduled, `Arbitrary call to ${this}.toBeHydrated()`);
                const { dirtyAttrs, dirtyBody, attrs, domNode } = this;
                const len = dirtyAttrs.length;
                this.dirtyAttrs = [];
                for (let i = 0; i < len; i += 1) {
                    const attrName = dirtyAttrs[i];
                    updateAttr(domNode, attrName, attrs[attrName]);
                }
                if (dirtyBody) {
                    this.dirtyBody = false;
                    this.mountBody();
                }
                this.isScheduled = false;
            }
        }

        findBestMatch(newElement: Object): Object {
            const { bodyMap, itemMap } = this;
            const item = newElement.item;
            const key = newElement.key;
            let reflectiveElementByItem;
            let reflectiveElementByKey;
            if (item && itemMap.has(item)) {
                const r = itemMap.get(item);
                // ignoring reflective method that does not match item's simetry
                if (r.item) {
                    reflectiveElementByItem = r;
                }
            }
            if (bodyMap.has(key)) {
                const r = bodyMap.get(key);
                // ignoring reflective method that does not match item's simetry
                if ((r.item && item) || (!r.item && !item)) {
                    reflectiveElementByKey = r;
                }
            }
            return reflectiveElementByItem || reflectiveElementByKey || null;
        }

        mountBody() {
            const { body, bodyMap, itemMap, domNode } = this;
            const newBodyMap = new Map();
            const newItemMap = new Map();
            const newChildNodes = new Array(len);
            let len = body.length;
            for (let i = 0; i < len; i += 1) {
                let newElement = body[i];
                if (newElement.vnode) {
                    if (!newElement.vnode.isMounted) {
                        mount(newElement);
                    }
                    bodyMap.delete(newElement.key);
                    itemMap.delete(newElement.item);
                    newElement.key = '>' + i;
                } else {
                    newElement.key = '>' + i;
                    const reflectiveElement = this.findBestMatch(newElement);
                    if (reflectiveElement) {
                        // if a reflective element is found, we can reuse its vnode
                        // to rehydrate the ui elements
                        bodyMap.delete(reflectiveElement.key);
                        itemMap.delete(reflectiveElement.item);
                        newElement = patch(reflectiveElement, newElement);
                    } else {
                        mount(newElement);
                    }
                }
                newBodyMap.set(newElement.key, newElement);
                if (newElement.item) {
                    newItemMap.set(newElement.item, newElement);
                }
                let newDomNode = getElementDomNode(newElement);
                newChildNodes[i] = newDomNode;
            }
            // dismounting the rest of the hanging elements
            dismountElements(bodyMap.values());
            this.bodyMap = newBodyMap;
            this.itemMap = newItemMap;
            // at this point, we have the new list of nodes, which is already
            // reusing as much as possible the existing dom elements, we need
            // to apply the diffing algo for vdom here:
            patchChildrenNodes(domNode, newChildNodes);
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
