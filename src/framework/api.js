// @flow

import {
    updateAttr,
} from "aura-dom";

import {
    getContext,
} from "./context.js";

import {
    getRef,
    opaqueToComponentMap,
} from "./createElement.js";

import {
    getComponentRootNode,
} from "./mounter.js";

function isComputedPropertyDirty(deps: Array<string>, dirtyPropNames: Object): boolean {
    for (let depPropName in deps) {
        if (dirtyPropNames[depPropName]) {
            return true;
        }
    }
    return false;
}

function getChildNodeByIndex(domNode: Node, childIndex: integer): Node|undefined {
    let o = domNode.childNodes[childIndex];
    if (!o) {
        throw new Error('Out of bound index ${childIndex} in markup ${domNode}.');
    }
    return o;
}

export { createElement } from "./createElement.js";

export function isDirty(component: Object, propName: string): boolean {
    const {isDirty, dirtyPropNames} = getContext(component);
    if (!propName) {
        return isDirty;
    }
    if (!dirtyPropNames[propName]) {
        let descriptor = Object.getOwnPropertyDescriptor(component, propName);
        if (descriptor && descriptor.get) {
            let deps = descriptor.get.dependencies;
            if (deps) {
                if (isComputedPropertyDirty(deps, dirtyPropNames)) {
                    return true;
                }
             } else {
                dirtyPropNames[propName] = false;
            }
        }
    }
    return dirtyPropNames[propName] || false;
}

export function updateAttributeInMarkup(component: Object, refId: string, attrName: string, attrValue: any) {
    let { domNode } = getRef(component, refId);
    if (domNode) {
        updateAttr(domNode, attrName, attrValue);
    }
}

export function updateRefComponentAttribute(component: Object, refId: string, attrName: string, attrValue: any) {
    let refInstance = getRef(component, refId);
    if (refInstance) {
        refInstance[attrName] = attrValue;
    }
}

export function updateContentInMarkup(component: Object, refId: string, childIndex: integer, content: string) {
    const { domNode } = getRef(component, refId);
    if (domNode) {
        const oldTextNode = getChildNodeByIndex(domNode, childIndex);
        // assert: oldTextNode should be a dom text node
        const textNode = document.createTextNode(content);
        domNode.replaceChild(textNode, oldTextNode);
    }
}

export function mountElementAsChild(component: Object, refId: string, position: integer, opaque: Object) {
    const { domNode } = getRef(component, refId);
    if (domNode) {
        const oldNode = getChildNodeByIndex(domNode, position);
        let tree = null;
        // assert: oldTextNode should be a dom text node
        if (opaque !== null) {
            const newChildComponent = opaqueToComponentMap.get(opaque);
            tree = getComponentRootNode(newChildComponent);
        } else {
            tree = document.createComment('facet');
        }
        domNode.replaceChild(tree, oldNode);
    }
}

export function componentWasRehydrated(component: Object): any {
    const ctx = getContext(component);
    const {dirtyPropNames} = ctx;
    ctx.isDirty = false;
    for (let propName in dirtyPropNames) {
        dirtyPropNames[propName] = false;
    }
}
