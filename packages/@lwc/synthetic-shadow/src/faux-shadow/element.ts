/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    ArrayFilter,
    ArrayFind,
    ArrayPush,
    ArraySlice,
    assert,
    defineProperties,
    defineProperty,
    getOwnPropertyDescriptor,
    hasOwnProperty,
    isNull,
    isUndefined,
} from '@lwc/shared';
import featureFlags from '@lwc/features';
import {
    attachShadow,
    getShadowRoot,
    SyntheticShadowRootInterface,
    isHostElement,
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
import { arrayFromCollection, isGlobalPatchingSkipped } from '../shared/utils';
import { getNodeOwnerKey, isNodeShadowed } from '../faux-shadow/node';
import { assignedSlotGetterPatched } from './slot';

const {
    DISABLE_ELEMENT_PATCH,
    ENABLE_NODE_LIST_PATCH,
    ENABLE_HTML_COLLECTIONS_PATCH,
} = getInitializedFeatureFlags();

function getInitializedFeatureFlags() {
    let DISABLE_ELEMENT_PATCH;
    let ENABLE_NODE_LIST_PATCH;
    let ENABLE_HTML_COLLECTIONS_PATCH;

    if (featureFlags.ENABLE_ELEMENT_PATCH) {
        DISABLE_ELEMENT_PATCH = false;
    } else {
        DISABLE_ELEMENT_PATCH = true;
    }

    if (featureFlags.ENABLE_NODE_LIST_PATCH) {
        ENABLE_NODE_LIST_PATCH = true;
    } else {
        ENABLE_NODE_LIST_PATCH = false;
    }

    if (featureFlags.ENABLE_HTML_COLLECTIONS_PATCH) {
        ENABLE_HTML_COLLECTIONS_PATCH = true;
    } else {
        ENABLE_HTML_COLLECTIONS_PATCH = false;
    }

    return {
        DISABLE_ELEMENT_PATCH,
        ENABLE_NODE_LIST_PATCH,
        ENABLE_HTML_COLLECTIONS_PATCH,
    };
}

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
        assert.invariant(
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

function getFirstSlottedMatch(host: Element, nodeList: Element[]): Element | null {
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
    if (isHostElement(this)) {
        const shadow = getShadowRoot(this);
        if (shadow.mode === 'open') {
            return shadow;
        }
    }
    return null;
}

function childrenGetterPatched(this: Element): HTMLCollectionOf<Element> {
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

// Non-deep-traversing patches: this descriptor map includes all descriptors that
// do not five access to nodes beyond the immediate children.
defineProperties(Element.prototype, {
    innerHTML: {
        get(this: Element): string {
            if (DISABLE_ELEMENT_PATCH) {
                if (!isUndefined(getNodeOwnerKey(this)) || isHostElement(this)) {
                    return innerHTMLGetterPatched.call(this);
                }

                return innerHTMLGetter.call(this);
            }

            if (isNodeShadowed(this) || isHostElement(this)) {
                return innerHTMLGetterPatched.call(this);
            }
            // TODO: issue #1222 - remove global bypass
            if (isGlobalPatchingSkipped(this)) {
                return innerHTMLGetter.call(this);
            }
            return innerHTMLGetterPatched.call(this);
        },
        set(v: string) {
            innerHTMLSetter.call(this, v);
        },
        enumerable: true,
        configurable: true,
    },
    outerHTML: {
        get(this: Element): string {
            if (DISABLE_ELEMENT_PATCH) {
                if (!isUndefined(getNodeOwnerKey(this)) || isHostElement(this)) {
                    return outerHTMLGetterPatched.call(this);
                }
                return outerHTMLGetter.call(this);
            }

            if (isNodeShadowed(this) || isHostElement(this)) {
                return outerHTMLGetterPatched.call(this);
            }
            // TODO: issue #1222 - remove global bypass
            if (isGlobalPatchingSkipped(this)) {
                return outerHTMLGetter.call(this);
            }
            return outerHTMLGetterPatched.call(this);
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
    const nodeList = arrayFromCollection(
        elementQuerySelectorAll.apply(this, ArraySlice.call(arguments) as [string])
    );
    if (isHostElement(this)) {
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
        if (!isUndefined(ownerKey) || ENABLE_NODE_LIST_PATCH) {
            const elm = ArrayFind.call(nodeList, elm => getNodeOwnerKey(elm) === ownerKey);
            return isUndefined(elm) ? null : elm;
        } else {
            // `this` is a manually inserted element inside a shadowRoot
            const elm = nodeList[0];
            return isUndefined(elm) ? null : elm;
        }
    } else {
        // Note: document.body is already patched!
        if (this instanceof HTMLBodyElement || ENABLE_NODE_LIST_PATCH) {
            // element belonging to the document
            const elm = ArrayFind.call(
                nodeList,
                // TODO: issue #1222 - remove global bypass
                elm => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(this)
            );
            return isUndefined(elm) ? null : elm;
        } else {
            const elm = nodeList[0];
            return isUndefined(elm) ? null : elm;
        }
    }
}

function getFilteredNodeListQueryResult(
    context: Element,
    nodeList,
    isShadowSemanticEnforced: boolean
): Element[] {
    let filtered: Element[];
    if (isHostElement(context)) {
        // element with shadowRoot attached
        const owner = getNodeOwner(context);
        if (isNull(owner)) {
            filtered = [];
        } else if (getNodeKey(context)) {
            // it is a custom element, and we should then filter by slotted elements
            filtered = getAllSlottedMatches(context, nodeList);
        } else {
            // regular element, we should then filter by ownership
            filtered = getAllMatches(owner, nodeList);
        }
    } else if (isNodeShadowed(context)) {
        // element inside a shadowRoot
        const ownerKey = getNodeOwnerKey(context);
        if (!isUndefined(ownerKey) || isShadowSemanticEnforced) {
            // The patch is enabled or `context` is an element rendered by lwc
            filtered = ArrayFilter.call(nodeList, elm => getNodeOwnerKey(elm) === ownerKey);
        } else {
            // `context` is a manually inserted element inside a shadowRoot
            filtered = ArraySlice.call(nodeList);
        }
    } else {
        if (context instanceof HTMLBodyElement || isShadowSemanticEnforced) {
            // `context` is document.body or element belonging to the document with the patch enabled
            filtered = ArrayFilter.call(
                nodeList,
                // TODO: issue #1222 - remove global bypass
                elm => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(context)
            );
        } else {
            // `context` is outside the lwc boundary and patch is not enabled.
            filtered = ArraySlice.call(nodeList);
        }
    }
    return filtered;
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
defineProperties(Element.prototype, {
    querySelector: {
        value: querySelectorPatched,
        writable: true,
        enumerable: true,
        configurable: true,
    },
    querySelectorAll: {
        value(this: HTMLBodyElement): NodeListOf<Element> {
            const nodeList = arrayFromCollection(
                elementQuerySelectorAll.apply(this, ArraySlice.call(arguments) as [string])
            );
            const filteredResults = getFilteredNodeListQueryResult(
                this,
                nodeList,
                ENABLE_NODE_LIST_PATCH
            );

            return createStaticNodeList(filteredResults);
        },
        writable: true,
        enumerable: true,
        configurable: true,
    },
    getElementsByClassName: {
        value(this: HTMLBodyElement): HTMLCollectionOf<Element> {
            const elements = arrayFromCollection(
                elementGetElementsByClassName.apply(this, ArraySlice.call(arguments) as [string])
            );

            const filteredResults = getFilteredNodeListQueryResult(
                this,
                elements,
                ENABLE_HTML_COLLECTIONS_PATCH
            );

            return createStaticHTMLCollection(filteredResults);
        },
        writable: true,
        enumerable: true,
        configurable: true,
    },
    getElementsByTagName: {
        value(this: HTMLBodyElement): HTMLCollectionOf<Element> {
            const elements = arrayFromCollection(
                elementGetElementsByTagName.apply(this, ArraySlice.call(arguments) as [string])
            );

            const filteredResults = getFilteredNodeListQueryResult(
                this,
                elements,
                ENABLE_HTML_COLLECTIONS_PATCH
            );

            return createStaticHTMLCollection(filteredResults);
        },
        writable: true,
        enumerable: true,
        configurable: true,
    },
    getElementsByTagNameNS: {
        value(this: HTMLBodyElement): HTMLCollectionOf<Element> {
            const elements = arrayFromCollection(
                elementGetElementsByTagNameNS.apply(this, ArraySlice.call(arguments) as [
                    string,
                    string
                ])
            );

            const filteredResults = getFilteredNodeListQueryResult(
                this,
                elements,
                ENABLE_HTML_COLLECTIONS_PATCH
            );

            return createStaticHTMLCollection(filteredResults);
        },
        writable: true,
        enumerable: true,
        configurable: true,
    },
});

// IE11 extra patches for wrong prototypes
if (hasOwnProperty.call(HTMLElement.prototype, 'getElementsByClassName')) {
    defineProperty(HTMLElement.prototype, 'getElementsByClassName', getOwnPropertyDescriptor(
        Element.prototype,
        'getElementsByClassName'
    ) as PropertyDescriptor);
}
