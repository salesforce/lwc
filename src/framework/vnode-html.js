// @flow

import mounter from "./mounter.js";
import patcher from "./patcher.js";
import dismounter from "./dismounter.js";
import { log } from "./utils.js";

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

        static vnodeType = tagName;

        constructor(attrs: Object, body: array<Object>) {
            super();
            this.domNode = createElement(tagName);
            this.bodyMap = new Map();
            this.itemMap = new Map();
            // TODO: keep track of tagName-s that can have body
            this.hasBodyAttribute = true;
            this.attrs = attrs;
            this.body = body;
            this.dirtyAttrs = [];
            this.dirtyBody = false;
            this.aboutToBeHydrated = false;
        }

        set(attrName: string, attrValue: any) {
            if (attrName === 'body') {
                this.dirtyBody = true;
                this.body = attrValue;
            } else {
                this.dirtyAttrs.push(attrName);
                this.attrs[attrName] = attrValue;
            }
            this.scheduleRehydration();
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
                    DEVELOPMENT && log('Updating before mounting: ', domNode, attrName, attrValue);
                    updateAttr(domNode, attrName, attrValue);
                }
            }
            this.mountBody();
        }

        scheduleRehydration() {
            if (!this.aboutToBeHydrated) {
                this.aboutToBeHydrated = true;
                Promise.resolve().then((): any => this.toBeHydrated());
            }
        }

        toBeHydrated() {
            if (this.isMounted && this.aboutToBeHydrated) {
                this.aboutToBeHydrated = false;
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
            }
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

        patchChildrenNodes(newChildNodes: Array<Node>) {
            const { domNode } = this;
            const oldChildNodes = [...domNode.childNodes];
            let len = Math.max(oldChildNodes.length, newChildNodes.length);
            for (let i = 0; i < len; i += 1) {
                const oldDomNode = oldChildNodes[i];
                const newDomNode = newChildNodes[i];
                if (newDomNode !== oldDomNode) {
                    if (newDomNode && !oldDomNode) {
                        domNode.appendChild(newDomNode);
                    } else if (newDomNode && oldDomNode) {
                        domNode.insertBefore(newDomNode, oldDomNode);
                    } else {
                        domNode.removeChild(oldDomNode);
                    }
                }
            }
        }

        mountBody() {
            const { body, bodyMap, itemMap } = this;
            const newBodyMap = new Map();
            const newItemMap = new Map();
            const newChildNodes = new Array(len);
            let len = body.length;
            for (let i = 0; i < len; i += 1) {
                let newElement = body[i];
                newElement.key = '>' + i;
                const reflectiveElement = this.findBestMatch(newElement);
                if (reflectiveElement) {
                    // if a reflective element is found, we can reuse its vnode
                    // to rehydrate the ui elements
                    bodyMap.delete(reflectiveElement.key);
                    itemMap.delete(reflectiveElement.item);
                    newElement = patcher(reflectiveElement, newElement);
                } else {
                    mounter(newElement);
                }
                newBodyMap.set(newElement.key, newElement);
                if (newElement.item) {
                    newItemMap.set(newElement.item, newElement);
                }
                let newDomNode = getElementDomNode(newElement);
                newChildNodes[i] = newDomNode;
            }
            // dismounting the rest of the hanging elements
            const condemned = new Set(bodyMap.values());
            for (let elementToBeDismounted of condemned) {
                dismounter(elementToBeDismounted);
            }
            this.bodyMap = newBodyMap;
            this.itemMap = newItemMap;
            // at this point, we have the new list of nodes, which is already
            // reusing as much as possible the existing dom elements, we need
            // to apply the diffing algo for vdom here:
            this.patchChildrenNodes(newChildNodes);
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
