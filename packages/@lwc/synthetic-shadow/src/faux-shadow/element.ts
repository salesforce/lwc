/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    ArrayFilter,
    ArrayFind,
    ArraySlice,
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
    getFirstMatch,
    getAllSlottedMatches,
    getFirstSlottedMatch,
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
import { getNodeKey, getInternalChildNodes, hasMountedChildren } from './node';
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
import { getNonPatchedFilteredCollectionResult } from './no-patch-utils';

const { DISABLE_ELEMENT_PATCH, ENABLE_NODE_LIST_PATCH } = getInitializedFeatureFlags();

function getInitializedFeatureFlags() {
    let DISABLE_ELEMENT_PATCH;
    let ENABLE_NODE_LIST_PATCH;

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

    return {
        DISABLE_ELEMENT_PATCH,
        ENABLE_NODE_LIST_PATCH,
    };
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
            let filteredResults;
            const elements = arrayFromCollection(
                elementGetElementsByClassName.apply(this, ArraySlice.call(arguments) as [string])
            );

            if (featureFlags.ENABLE_HTML_COLLECTIONS_PATCH) {
                filteredResults = getFilteredNodeListQueryResult(this, elements, true);
            } else {
                filteredResults = getNonPatchedFilteredCollectionResult(this, elements);
            }

            return createStaticHTMLCollection(filteredResults);
        },
        writable: true,
        enumerable: true,
        configurable: true,
    },
    getElementsByTagName: {
        value(this: HTMLBodyElement): HTMLCollectionOf<Element> {
            let filteredResults;
            const elements = arrayFromCollection(
                elementGetElementsByTagName.apply(this, ArraySlice.call(arguments) as [string])
            );

            if (featureFlags.ENABLE_HTML_COLLECTIONS_PATCH) {
                filteredResults = getFilteredNodeListQueryResult(this, elements, true);
            } else {
                filteredResults = getNonPatchedFilteredCollectionResult(this, elements);
            }

            return createStaticHTMLCollection(filteredResults);
        },
        writable: true,
        enumerable: true,
        configurable: true,
    },
    getElementsByTagNameNS: {
        value(this: HTMLBodyElement): HTMLCollectionOf<Element> {
            let filteredResults;
            const elements = arrayFromCollection(
                elementGetElementsByTagNameNS.apply(this, ArraySlice.call(arguments) as [
                    string,
                    string
                ])
            );

            if (featureFlags.ENABLE_HTML_COLLECTIONS_PATCH) {
                filteredResults = getFilteredNodeListQueryResult(this, elements, true);
            } else {
                filteredResults = getNonPatchedFilteredCollectionResult(this, elements);
            }

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
