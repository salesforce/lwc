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
    KEY__SYNTHETIC_MODE,
} from '@lwc/shared';

import {
    attachShadow as originalAttachShadow,
    childrenGetter,
    childElementCountGetter,
    firstElementChildGetter,
    getElementsByClassName as elementGetElementsByClassName,
    getElementsByTagName as elementGetElementsByTagName,
    getElementsByTagNameNS as elementGetElementsByTagNameNS,
    innerHTMLGetter,
    innerHTMLSetter,
    lastElementChildGetter,
    outerHTMLSetter,
    outerHTMLGetter,
    querySelectorAll as elementQuerySelectorAll,
    shadowRootGetter as originalShadowRootGetter,
} from '../env/element';

import { getOuterHTML } from '../3rdparty/polymer/outer-html';

import { createStaticNodeList } from '../shared/static-node-list';
import { createStaticHTMLCollection } from '../shared/static-html-collection';
import { arrayFromCollection, isGlobalPatchingSkipped } from '../shared/utils';
import {
    getNodeKey,
    getNodeNearestOwnerKey,
    getNodeOwnerKey,
    isNodeShadowed,
} from '../shared/node-ownership';

import { assignedSlotGetterPatched } from './slot';
import { getInternalChildNodes, hasMountedChildren } from './node';
import { getNonPatchedFilteredArrayOfNodes } from './no-patch-utils';
import { attachShadow, getShadowRoot, isSyntheticShadowHost } from './shadow-root';
import {
    getNodeOwner,
    getAllMatches,
    getFilteredChildNodes,
    getFirstMatch,
    getAllSlottedMatches,
    getFirstSlottedMatch,
} from './traverse';

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

function attachShadowPatched(this: Element, options: ShadowRootInit): ShadowRoot {
    // To retain native behavior of the API, provide synthetic shadowRoot only when specified
    if ((options as any)[KEY__SYNTHETIC_MODE]) {
        return attachShadow(this, options);
    }
    return originalAttachShadow.call(this, options);
}

function shadowRootGetterPatched(this: Element): ShadowRoot | null {
    if (isSyntheticShadowHost(this)) {
        const shadow = getShadowRoot(this);
        if (shadow.mode === 'open') {
            return shadow;
        }
    }
    return originalShadowRootGetter.call(this);
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
            // Note: we deviate from native shadow here, but are not fixing
            // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
            if (isNodeShadowed(this) || isSyntheticShadowHost(this)) {
                return innerHTMLGetterPatched.call(this);
            }

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
            // Note: we deviate from native shadow here, but are not fixing
            // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
            if (isNodeShadowed(this) || isSyntheticShadowHost(this)) {
                return outerHTMLGetterPatched.call(this);
            }
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
    defineProperty(
        HTMLElement.prototype,
        'innerHTML',
        getOwnPropertyDescriptor(Element.prototype, 'innerHTML')!
    );
}
if (hasOwnProperty.call(HTMLElement.prototype, 'outerHTML')) {
    defineProperty(
        HTMLElement.prototype,
        'outerHTML',
        getOwnPropertyDescriptor(Element.prototype, 'outerHTML')!
    );
}
if (hasOwnProperty.call(HTMLElement.prototype, 'children')) {
    defineProperty(
        HTMLElement.prototype,
        'children',
        getOwnPropertyDescriptor(Element.prototype, 'children')!
    );
}

// Deep-traversing patches from this point on:

function querySelectorPatched(this: Element /*, selector: string*/): Element | null {
    const nodeList = arrayFromCollection(
        elementQuerySelectorAll.apply(this, ArraySlice.call(arguments) as [string])
    );
    if (isSyntheticShadowHost(this)) {
        // element with shadowRoot attached
        const owner = getNodeOwner(this);
        if (!isUndefined(getNodeKey(this))) {
            // it is a custom element, and we should then filter by slotted elements
            return getFirstSlottedMatch(this, nodeList);
        } else if (isNull(owner)) {
            return null;
        } else {
            // regular element, we should then filter by ownership
            return getFirstMatch(owner, nodeList);
        }
    } else if (isNodeShadowed(this)) {
        // element inside a shadowRoot
        const ownerKey = getNodeOwnerKey(this);
        if (!isUndefined(ownerKey)) {
            // `this` is handled by lwc, using getNodeNearestOwnerKey to include manually inserted elements in the same shadow.
            const elm = ArrayFind.call(nodeList, (elm) => getNodeNearestOwnerKey(elm) === ownerKey);
            return isUndefined(elm) ? null : elm;
        } else {
            // Note: we deviate from native shadow here, but are not fixing
            // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
            // `this` is a manually inserted element inside a shadowRoot, return the first element.
            return nodeList.length === 0 ? null : nodeList[0];
        }
    } else {
        if (!(this instanceof HTMLBodyElement)) {
            const elm = nodeList[0];
            return isUndefined(elm) ? null : elm;
        }

        // element belonging to the document
        const elm = ArrayFind.call(
            nodeList,
            (elm) => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(this)
        );
        return isUndefined(elm) ? null : elm;
    }
}

function getFilteredArrayOfNodes<T extends Node>(context: Element, unfilteredNodes: T[]): T[] {
    let filtered: T[];
    if (isSyntheticShadowHost(context)) {
        // element with shadowRoot attached
        const owner = getNodeOwner(context);
        if (!isUndefined(getNodeKey(context))) {
            // it is a custom element, and we should then filter by slotted elements
            filtered = getAllSlottedMatches(context, unfilteredNodes);
        } else if (isNull(owner)) {
            filtered = [];
        } else {
            // regular element, we should then filter by ownership
            filtered = getAllMatches(owner, unfilteredNodes);
        }
    } else if (isNodeShadowed(context)) {
        // element inside a shadowRoot
        const ownerKey = getNodeOwnerKey(context);
        if (!isUndefined(ownerKey)) {
            // context is handled by lwc, using getNodeNearestOwnerKey to include manually inserted elements in the same shadow.
            filtered = ArrayFilter.call(
                unfilteredNodes,
                (elm) => getNodeNearestOwnerKey(elm) === ownerKey
            );
        } else {
            // Note: we deviate from native shadow here, but are not fixing
            // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
            // context is manually inserted without lwc:dom-manual, return everything
            filtered = ArraySlice.call(unfilteredNodes);
        }
    } else {
        if (context instanceof HTMLBodyElement) {
            // `context` is document.body or element belonging to the document with the patch enabled
            filtered = ArrayFilter.call(
                unfilteredNodes,
                (elm) => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(context)
            );
        } else {
            // `context` is outside the lwc boundary and patch is not enabled.
            filtered = ArraySlice.call(unfilteredNodes);
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

            // Note: we deviate from native shadow here, but are not fixing
            // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
            const filteredResults = getFilteredArrayOfNodes(this, nodeList);
            return createStaticNodeList(filteredResults);
        },
        writable: true,
        enumerable: true,
        configurable: true,
    },
});

// The following APIs are used directly by Jest internally so we avoid patching them during testing.
if (process.env.NODE_ENV !== 'test') {
    defineProperties(Element.prototype, {
        getElementsByClassName: {
            value(this: HTMLBodyElement): HTMLCollectionOf<Element> {
                const elements = arrayFromCollection(
                    elementGetElementsByClassName.apply(
                        this,
                        ArraySlice.call(arguments) as [string]
                    )
                );

                // Note: we deviate from native shadow here, but are not fixing
                // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
                return createStaticHTMLCollection(
                    getNonPatchedFilteredArrayOfNodes(this, elements)
                );
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

                // Note: we deviate from native shadow here, but are not fixing
                // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
                return createStaticHTMLCollection(
                    getNonPatchedFilteredArrayOfNodes(this, elements)
                );
            },
            writable: true,
            enumerable: true,
            configurable: true,
        },
        getElementsByTagNameNS: {
            value(this: HTMLBodyElement): HTMLCollectionOf<Element> {
                const elements = arrayFromCollection(
                    elementGetElementsByTagNameNS.apply(
                        this,
                        ArraySlice.call(arguments) as [string, string]
                    )
                );

                // Note: we deviate from native shadow here, but are not fixing
                // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
                return createStaticHTMLCollection(
                    getNonPatchedFilteredArrayOfNodes(this, elements)
                );
            },
            writable: true,
            enumerable: true,
            configurable: true,
        },
    });
}

// IE11 extra patches for wrong prototypes
if (hasOwnProperty.call(HTMLElement.prototype, 'getElementsByClassName')) {
    defineProperty(
        HTMLElement.prototype,
        'getElementsByClassName',
        getOwnPropertyDescriptor(Element.prototype, 'getElementsByClassName') as PropertyDescriptor
    );
}
