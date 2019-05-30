/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from '../shared/assert';
import {
    attachShadow,
    getShadowRoot,
    SyntheticShadowRootInterface,
    hasSyntheticShadow,
} from './shadow-root';
import {
    getNodeOwner,
    getAllMatches,
    getFilteredChildNodes,
    isSlotElement,
    isNodeOwnedBy,
    getFirstMatch,
} from './traverse';
import {
    childrenGetter,
    outerHTMLSetter,
    childElementCountGetter,
    firstElementChildGetter,
    lastElementChildGetter,
    innerHTMLGetter,
    outerHTMLGetter,
} from '../env/element';
import {
    isNull,
    ArrayFilter,
    ArrayPush,
    defineProperties,
    defineProperty,
    getOwnPropertyDescriptor,
    hasOwnProperty,
    ArrayFind,
    ArraySlice,
    isUndefined,
} from '../shared/language';
import { createStaticNodeList } from '../shared/static-node-list';
import { createStaticHTMLCollection } from '../shared/static-html-collection';
import {
    getNodeKey,
    getNodeNearestOwnerKey,
    getInternalChildNodes,
    hasMountedChildren,
} from './node';
import {
    compareDocumentPosition,
    DOCUMENT_POSITION_CONTAINS,
    parentElementGetter,
} from '../env/node';
import {
    innerHTMLSetter,
    getElementsByClassName as elementGetElementsByClassName,
    getElementsByTagName as elementGetElementsByTagName,
    getElementsByTagNameNS as elementGetElementsByTagNameNS,
    querySelectorAll as elementQuerySelectorAll,
} from '../env/element';
import { getOuterHTML } from '../3rdparty/polymer/outer-html';
import { isGlobalPatchingSkipped } from '../shared/utils';
import { getNodeOwnerKey, isNodeShadowed } from '../faux-shadow/node';
import { assignedSlotGetterPatched } from './slot';

// when finding a slot in the DOM, we can fold it if it is contained
// inside another slot.
function foldSlotElement(slot: HTMLElement) {
    let parent = parentElementGetter.call(slot);
    while (!isNull(parent) && isSlotElement(parent)) {
        slot = parent as HTMLElement;
        parent = parentElementGetter.call(slot);
    }
    return slot;
}

function isNodeSlotted(host: Element, node: Node): boolean {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            host instanceof HTMLElement,
            `isNodeSlotted() should be called with a host as the first argument instead of ${host}`
        );
        assert.invariant(
            node instanceof Node,
            `isNodeSlotted() should be called with a node as the second argument instead of ${node}`
        );
        assert.isTrue(
            compareDocumentPosition.call(node, host) & DOCUMENT_POSITION_CONTAINS,
            `isNodeSlotted() should never be called with a node that is not a child node of ${host}`
        );
    }
    const hostKey = getNodeKey(host);
    // this routine assumes that the node is coming from a different shadow (it is not owned by the host)
    // just in case the provided node is not an element
    let currentElement = node instanceof Element ? node : parentElementGetter.call(node);
    while (!isNull(currentElement) && currentElement !== host) {
        const elmOwnerKey = getNodeNearestOwnerKey(currentElement);
        const parent = parentElementGetter.call(currentElement);
        if (elmOwnerKey === hostKey) {
            // we have reached an element inside the host's template, and only if
            // that element is an slot, then the node is considered slotted
            return isSlotElement(currentElement);
        } else if (parent === host) {
            return false;
        } else if (!isNull(parent) && getNodeNearestOwnerKey(parent) !== elmOwnerKey) {
            // we are crossing a boundary of some sort since the elm and its parent
            // have different owner key. for slotted elements, this is possible
            // if the parent happens to be a slot.
            if (isSlotElement(parent)) {
                /**
                 * the slot parent might be allocated inside another slot, think of:
                 * <x-root> (<--- root element)
                 *    <x-parent> (<--- own by x-root)
                 *       <x-child> (<--- own by x-root)
                 *           <slot> (<--- own by x-child)
                 *               <slot> (<--- own by x-parent)
                 *                  <div> (<--- own by x-root)
                 *
                 * while checking if x-parent has the div slotted, we need to traverse
                 * up, but when finding the first slot, we skip that one in favor of the
                 * most outer slot parent before jumping into its corresponding host.
                 */
                currentElement = getNodeOwner(foldSlotElement(parent as HTMLElement));
                if (!isNull(currentElement)) {
                    if (currentElement === host) {
                        // the slot element is a top level element inside the shadow
                        // of a host that was allocated into host in question
                        return true;
                    } else if (getNodeNearestOwnerKey(currentElement) === hostKey) {
                        // the slot element is an element inside the shadow
                        // of a host that was allocated into host in question
                        return true;
                    }
                }
            } else {
                return false;
            }
        } else {
            currentElement = parent;
        }
    }
    return false;
}

function getAllSlottedMatches(host: Element, nodeList: NodeList | Node[]): Array<Node & Element> {
    const filteredAndPatched = [];
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        const node = nodeList[i];
        if (!isNodeOwnedBy(host, node) && isNodeSlotted(host, node)) {
            ArrayPush.call(filteredAndPatched, node);
        }
    }
    return filteredAndPatched;
}

function getFirstSlottedMatch(host: Element, nodeList: NodeList): Element | null {
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        const node = nodeList[i] as Element;
        if (!isNodeOwnedBy(host, node) && isNodeSlotted(host, node)) {
            return node;
        }
    }
    return null;
}

function innerHTMLGetterPatched(this: Element): string {
    const childNodes = getInternalChildNodes(this);
    let innerHTML = '';
    for (let i = 0, len = childNodes.length; i < len; i += 1) {
        innerHTML += getOuterHTML(childNodes[i]);
    }
    return innerHTML;
}

function outerHTMLGetterPatched(this: Element) {
    return getOuterHTML(this);
}

function attachShadowPatched(this: Element, options: ShadowRootInit): SyntheticShadowRootInterface {
    return attachShadow(this, options);
}

function shadowRootGetterPatched(this: Element): SyntheticShadowRootInterface | null {
    if (hasSyntheticShadow(this)) {
        const shadow = getShadowRoot(this);
        if (shadow.mode === 'open') {
            return shadow;
        }
    }
    return null;
}

function childrenGetterPatched(this: Element): HTMLCollectionOf<Element> {
    // We cannot patch `children` in test mode
    // because JSDOM uses children for its "native"
    // querySelector implementation. If we patch this,
    // HTMLElement.prototype.querySelector.call(element) will not
    // return any elements from shadow, which is not what we want
    if (process.env.NODE_ENV === 'test') {
        return childrenGetter.call(this);
    }
    const owner = getNodeOwner(this);
    const childNodes = isNull(owner) ? [] : getAllMatches(owner, getFilteredChildNodes(this));
    return createStaticHTMLCollection(
        ArrayFilter.call(childNodes, (node: Node | Element) => node instanceof Element)
    );
}

function childElementCountGetterPatched(this: ParentNode) {
    return this.children.length;
}

function firstElementChildGetterPatched(this: ParentNode) {
    return this.children[0] || null;
}

function lastElementChildGetterPatched(this: ParentNode) {
    const { children } = this;
    return children.item(children.length - 1) || null;
}

// Non-deep-traversing patches
defineProperties(Element.prototype, {
    innerHTML: {
        get(this: Element): string {
            if (isNodeShadowed(this) || hasSyntheticShadow(this)) {
                return innerHTMLGetterPatched.call(this);
            }
            // TODO: make this a global patch with a way to disable it
            return innerHTMLGetter.call(this);
        },
        set(v: string) {
            innerHTMLSetter.call(this, v);
        },
        enumerable: true,
        configurable: true,
    },
    outerHTML: {
        get(this: Element): string {
            if (isNodeShadowed(this) || hasSyntheticShadow(this)) {
                return outerHTMLGetterPatched.call(this);
            }
            // TODO: make this a global patch with a way to disable it
            return outerHTMLGetter.call(this);
        },
        set(v: string) {
            outerHTMLSetter.call(this, v);
        },
        enumerable: true,
        configurable: true,
    },
    attachShadow: {
        value: attachShadowPatched,
        enumerable: true,
        writable: true,
        configurable: true,
    },
    shadowRoot: {
        get: shadowRootGetterPatched,
        enumerable: true,
        configurable: true,
    },
    // patched in HTMLElement if exists (IE11 is the one off here)
    children: {
        get(this: Element): HTMLCollectionOf<Element> {
            if (hasMountedChildren(this)) {
                return childrenGetterPatched.call(this);
            }
            return childrenGetter.call(this);
        },
        enumerable: true,
        configurable: true,
    },
    childElementCount: {
        get(this: Element): number {
            if (hasMountedChildren(this)) {
                return childElementCountGetterPatched.call(this);
            }
            return childElementCountGetter.call(this);
        },
        enumerable: true,
        configurable: true,
    },
    firstElementChild: {
        get(this: Element): Element | null {
            if (hasMountedChildren(this)) {
                return firstElementChildGetterPatched.call(this);
            }
            return firstElementChildGetter.call(this);
        },
        enumerable: true,
        configurable: true,
    },
    lastElementChild: {
        get(this: Element): Element | null {
            if (hasMountedChildren(this)) {
                return lastElementChildGetterPatched.call(this);
            }
            return lastElementChildGetter.call(this);
        },
        enumerable: true,
        configurable: true,
    },
    assignedSlot: {
        get: assignedSlotGetterPatched,
        enumerable: true,
        configurable: true,
    },
});

// IE11 extra patches for wrong prototypes
if (hasOwnProperty.call(HTMLElement.prototype, 'innerHTML')) {
    defineProperty(HTMLElement.prototype, 'innerHTML', getOwnPropertyDescriptor(
        Element.prototype,
        'innerHTML'
    ) as PropertyDescriptor);
}
if (hasOwnProperty.call(HTMLElement.prototype, 'outerHTML')) {
    defineProperty(HTMLElement.prototype, 'outerHTML', getOwnPropertyDescriptor(
        Element.prototype,
        'outerHTML'
    ) as PropertyDescriptor);
}
if (hasOwnProperty.call(HTMLElement.prototype, 'children')) {
    defineProperty(HTMLElement.prototype, 'children', getOwnPropertyDescriptor(
        Element.prototype,
        'children'
    ) as PropertyDescriptor);
}

// Deep-traversing patches from this point on:

function querySelectorPatched(this: Element /*, selector: string*/): Element | null {
    const nodeList = elementQuerySelectorAll.apply(this, ArraySlice.call(arguments) as [string]);
    if (hasSyntheticShadow(this)) {
        // element with shadowRoot attached
        const owner = getNodeOwner(this);
        if (isNull(owner)) {
            return null;
        } else if (getNodeKey(this)) {
            // it is a custom element, and we should then filter by slotted elements
            return getFirstSlottedMatch(this, nodeList);
        } else {
            // regular element, we should then filter by ownership
            return getFirstMatch(owner, nodeList);
        }
    } else if (isNodeShadowed(this)) {
        // element inside a shadowRoot
        const ownerKey = getNodeOwnerKey(this);
        const elm = ArrayFind.call(nodeList, elm => getNodeOwnerKey(elm) === ownerKey);
        return isUndefined(elm) ? null : elm;
    } else {
        // element belonging to the document where we still allow skipping
        const elm = ArrayFind.call(
            nodeList,
            elm => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(this)
        );
        return isUndefined(elm) ? null : elm;
    }
}

function querySelectorAllPatched(this: Element /*, selector: string*/): NodeListOf<Element> {
    const nodeList = elementQuerySelectorAll.apply(this, ArraySlice.call(arguments) as [string]);
    let filtered: Element[];
    if (hasSyntheticShadow(this)) {
        // element with shadowRoot attached
        const owner = getNodeOwner(this);
        if (isNull(owner)) {
            filtered = [];
        } else if (getNodeKey(this)) {
            // it is a custom element, and we should then filter by slotted elements
            filtered = getAllSlottedMatches(this, nodeList);
        } else {
            // regular element, we should then filter by ownership
            filtered = getAllMatches(owner, nodeList);
        }
    } else if (isNodeShadowed(this)) {
        // element inside a shadowRoot
        const ownerKey = getNodeOwnerKey(this);
        filtered = ArrayFilter.call(nodeList, elm => getNodeOwnerKey(elm) === ownerKey);
    } else {
        // element belonging to the document where we still allow skipping
        filtered = ArrayFilter.call(
            nodeList,
            elm => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(this)
        );
    }
    return createStaticNodeList(filtered);
}

// The following patched methods hide shadowed elements from global
// traversing mechanisms. They are simplified for performance reasons to
// filter by ownership and do not account for slotted elements. This
// compromise is fine for our synthetic shadow dom because root elements
// cannot have slotted elements.
// Another compromise here is that all these traversing methods will return
// static HTMLCollection or static NodeList. We decided that this compromise
// is not a big problem considering the amount of code that is relying on
// the liveliness of these results are rare.
defineProperty(Element.prototype, 'querySelector', {
    value: querySelectorPatched,
    writable: true,
    enumerable: true,
    configurable: true,
});

defineProperty(Element.prototype, 'querySelectorAll', {
    value: querySelectorAllPatched,
    writable: true,
    enumerable: true,
    configurable: true,
});

// Note: Element.getElementsByTagName, Element.getElementsByTagNameNS and Element.getElementsByClassName are purposefully
// omitted from the list of patched methods. In order for the querySelector* APIs to run
// properly in jsdom, we need to make sure those methods doesn't respect the shadow DOM
// semantic.
// https://github.com/salesforce/lwc/pull/1179#issuecomment-484041707

defineProperty(HTMLBodyElement.prototype, 'getElementsByClassName', {
    value(this: HTMLBodyElement): HTMLCollectionOf<Element> {
        const elements = elementGetElementsByClassName.apply(this, ArraySlice.call(arguments) as [
            string
        ]);
        const ownerKey = getNodeOwnerKey(this);
        const filtered = ArrayFilter.call(
            elements,
            elm => getNodeOwnerKey(elm) === ownerKey || isGlobalPatchingSkipped(this)
        );
        return createStaticHTMLCollection(filtered);
    },
    writable: true,
    enumerable: true,
    configurable: true,
});

defineProperty(HTMLBodyElement.prototype, 'getElementsByTagName', {
    value(this: HTMLBodyElement): HTMLCollectionOf<Element> {
        const elements = elementGetElementsByTagName.apply(this, ArraySlice.call(arguments) as [
            string
        ]);
        const ownerKey = getNodeOwnerKey(this);
        const filtered = ArrayFilter.call(
            elements,
            elm => getNodeOwnerKey(elm) === ownerKey || isGlobalPatchingSkipped(this)
        );
        return createStaticHTMLCollection(filtered);
    },
    writable: true,
    enumerable: true,
    configurable: true,
});

defineProperty(HTMLBodyElement.prototype, 'getElementsByTagNameNS', {
    value(this: HTMLBodyElement): HTMLCollectionOf<Element> {
        const elements = elementGetElementsByTagNameNS.apply(this, ArraySlice.call(arguments) as [
            string,
            string
        ]);
        const ownerKey = getNodeOwnerKey(this);
        const filtered = ArrayFilter.call(
            elements,
            elm => getNodeOwnerKey(elm) === ownerKey || isGlobalPatchingSkipped(this)
        );
        return createStaticHTMLCollection(filtered);
    },
    writable: true,
    enumerable: true,
    configurable: true,
});
