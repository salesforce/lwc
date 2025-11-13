/**
 * Copyright (c) 2025 Salesforce, Inc.
 */
if (!globalThis.lwcRuntimeFlags) {
  Object.defineProperty(globalThis, 'lwcRuntimeFlags', { value: Object.create(null) });
}
if (!lwcRuntimeFlags.ENABLE_FORCE_SHADOW_MIGRATE_MODE && !lwcRuntimeFlags.DISABLE_SYNTHETIC_SHADOW) {
/**
 * Copyright (c) 2025 Salesforce, Inc.
 */
/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
 *
 * @param value
 * @param msg
 */
function invariant(value, msg) {
    if (!value) {
        throw new Error(`Invariant Violation: ${msg}`);
    }
}
/**
 *
 * @param value
 * @param msg
 */
function isTrue$1(value, msg) {
    if (!value) {
        throw new Error(`Assert Violation: ${msg}`);
    }
}
/**
 *
 * @param value
 * @param msg
 */
function isFalse$1(value, msg) {
    if (value) {
        throw new Error(`Assert Violation: ${msg}`);
    }
}
/**
 *
 * @param msg
 */
function fail(msg) {
    throw new Error(msg);
}

var assert = /*#__PURE__*/Object.freeze({
    __proto__: null,
    fail: fail,
    invariant: invariant,
    isFalse: isFalse$1,
    isTrue: isTrue$1
});

/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { 
/** Detached {@linkcode Object.assign}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign MDN Reference}. */
assign, 
/** Detached {@linkcode Object.create}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create MDN Reference}. */
create, 
/** Detached {@linkcode Object.defineProperties}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties MDN Reference}. */
defineProperties, 
/** Detached {@linkcode Object.defineProperty}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty MDN Reference}. */
defineProperty, 
/** Detached {@linkcode Object.getOwnPropertyDescriptor}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor MDN Reference}. */
getOwnPropertyDescriptor, 
/** Detached {@linkcode Object.getPrototypeOf}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf MDN Reference}. */
getPrototypeOf, 
/** Detached {@linkcode Object.hasOwnProperty}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty MDN Reference}. */
hasOwnProperty, 
/** Detached {@linkcode Object.setPrototypeOf}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf MDN Reference}. */
setPrototypeOf, } = Object;
const { 
/** Detached {@linkcode Array.isArray}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray MDN Reference}. */
isArray} = Array;
// For some reason, JSDoc don't get picked up for multiple renamed destructured constants (even
// though it works fine for one, e.g. isArray), so comments for these are added to the export
// statement, rather than this declaration.
const { filter: ArrayFilter, find: ArrayFind, findIndex: ArrayFindIndex, indexOf: ArrayIndexOf, join: ArrayJoin, map: ArrayMap, push: ArrayPush, reduce: ArrayReduce, reverse: ArrayReverse, slice: ArraySlice, splice: ArraySplice, forEach, // Weird anomaly!
 } = Array.prototype;
/**
 * Determines whether the argument is `undefined`.
 * @param obj Value to test
 * @returns `true` if the value is `undefined`.
 */
function isUndefined(obj) {
    return obj === undefined;
}
/**
 * Determines whether the argument is `null`.
 * @param obj Value to test
 * @returns `true` if the value is `null`.
 */
function isNull(obj) {
    return obj === null;
}
/**
 * Determines whether the argument is `true`.
 * @param obj Value to test
 * @returns `true` if the value is `true`.
 */
function isTrue(obj) {
    return obj === true;
}
/**
 * Determines whether the argument is `false`.
 * @param obj Value to test
 * @returns `true` if the value is `false`.
 */
function isFalse(obj) {
    return obj === false;
}
/**
 * Determines whether the argument is a function.
 * @param obj Value to test
 * @returns `true` if the value is a function.
 */
// Replacing `Function` with a narrower type that works for all our use cases is tricky...
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function isFunction(obj) {
    return typeof obj === 'function';
}
/**
 * Determines whether the argument is an object or null.
 * @param obj Value to test
 * @returns `true` if the value is an object or null.
 */
function isObject(obj) {
    return typeof obj === 'object';
}
const OtS = {}.toString;
/**
 * Converts the argument to a string, safely accounting for objects with "null" prototype.
 * Note that `toString(null)` returns `"[object Null]"` rather than `"null"`.
 * @param obj Value to convert to a string.
 * @returns String representation of the value.
 */
function toString(obj) {
    if (obj?.toString) {
        // Arrays might hold objects with "null" prototype So using
        // Array.prototype.toString directly will cause an error Iterate through
        // all the items and handle individually.
        if (isArray(obj)) {
            // This behavior is slightly different from Array#toString:
            // 1. Array#toString calls `this.join`, rather than Array#join
            // Ex: arr = []; arr.join = () => 1; arr.toString() === 1; toString(arr) === ''
            // 2. Array#toString delegates to Object#toString if `this.join` is not a function
            // Ex: arr = []; arr.join = 'no'; arr.toString() === '[object Array]; toString(arr) = ''
            // 3. Array#toString converts null/undefined to ''
            // Ex: arr = [null, undefined]; arr.toString() === ','; toString(arr) === '[object Null],undefined'
            // 4. Array#toString converts recursive references to arrays to ''
            // Ex: arr = [1]; arr.push(arr, 2); arr.toString() === '1,,2'; toString(arr) throws
            // Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toString
            return ArrayJoin.call(ArrayMap.call(obj, toString), ',');
        }
        return obj.toString();
    }
    else if (typeof obj === 'object') {
        // This catches null and returns "[object Null]". Weird, but kept for backwards compatibility.
        return OtS.call(obj);
    }
    else {
        return String(obj);
    }
}

/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const KEY__SHADOW_RESOLVER = '$shadowResolver$';
const KEY__SHADOW_RESOLVER_PRIVATE = '$$ShadowResolverKey$$';
const KEY__SHADOW_STATIC = '$shadowStaticNode$';
const KEY__SHADOW_STATIC_PRIVATE = '$shadowStaticNodeKey$';
const KEY__SHADOW_TOKEN = '$shadowToken$';
const KEY__SHADOW_TOKEN_PRIVATE = '$$ShadowTokenKey$$';
// TODO [#3733]: remove support for legacy scope tokens
const KEY__LEGACY_SHADOW_TOKEN = '$legacyShadowToken$';
const KEY__LEGACY_SHADOW_TOKEN_PRIVATE = '$$LegacyShadowTokenKey$$';
const KEY__SYNTHETIC_MODE = '$$lwc-synthetic-mode';
const KEY__NATIVE_GET_ELEMENT_BY_ID = '$nativeGetElementById$';
const KEY__NATIVE_QUERY_SELECTOR_ALL = '$nativeQuerySelectorAll$';
/** version: 8.24.0 */

/**
 * Copyright (c) 2025 Salesforce, Inc.
 */
if (!globalThis.lwcRuntimeFlags) {
    Object.defineProperty(globalThis, 'lwcRuntimeFlags', { value: create(null) });
}
/** version: 8.24.0 */

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// TODO [#2472]: Remove this workaround when appropriate.
// eslint-disable-next-line @lwc/lwc-internal/no-global-node
const _Node = Node;
const nodePrototype = _Node.prototype;
const { DOCUMENT_POSITION_CONTAINED_BY, DOCUMENT_POSITION_CONTAINS, DOCUMENT_POSITION_PRECEDING, DOCUMENT_POSITION_FOLLOWING, ELEMENT_NODE, TEXT_NODE, CDATA_SECTION_NODE, PROCESSING_INSTRUCTION_NODE, COMMENT_NODE} = _Node;
const { appendChild, cloneNode, compareDocumentPosition, insertBefore, removeChild, replaceChild, hasChildNodes, } = nodePrototype;
const { contains } = HTMLElement.prototype;
const firstChildGetter = getOwnPropertyDescriptor(nodePrototype, 'firstChild').get;
const lastChildGetter = getOwnPropertyDescriptor(nodePrototype, 'lastChild').get;
const textContentGetter = getOwnPropertyDescriptor(nodePrototype, 'textContent').get;
const parentNodeGetter = getOwnPropertyDescriptor(nodePrototype, 'parentNode').get;
const ownerDocumentGetter = getOwnPropertyDescriptor(nodePrototype, 'ownerDocument').get;
const parentElementGetter = getOwnPropertyDescriptor(nodePrototype, 'parentElement').get;
const textContextSetter = getOwnPropertyDescriptor(nodePrototype, 'textContent').set;
const childNodesGetter = getOwnPropertyDescriptor(nodePrototype, 'childNodes').get;
const nextSiblingGetter = getOwnPropertyDescriptor(nodePrototype, 'nextSibling').get;
const isConnected = hasOwnProperty.call(nodePrototype, 'isConnected')
    ? getOwnPropertyDescriptor(nodePrototype, 'isConnected').get
    : function () {
        const doc = ownerDocumentGetter.call(this);
        // IE11
        return (
        // if doc is null, it means `this` is actually a document instance which
        // is always connected
        doc === null ||
            (compareDocumentPosition.call(doc, this) & DOCUMENT_POSITION_CONTAINED_BY) !== 0);
    };

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { getAttribute, getBoundingClientRect, getElementsByTagName: getElementsByTagName$1, getElementsByTagNameNS: getElementsByTagNameNS$1, hasAttribute, querySelector, querySelectorAll: querySelectorAll$1, removeAttribute, setAttribute, } = Element.prototype;
const attachShadow$1 = hasOwnProperty.call(Element.prototype, 'attachShadow')
    ? Element.prototype.attachShadow
    : () => {
        throw new TypeError('attachShadow() is not supported in current browser. Load the @lwc/synthetic-shadow polyfill and use Lightning Web Components');
    };
const childElementCountGetter = getOwnPropertyDescriptor(Element.prototype, 'childElementCount').get;
const firstElementChildGetter = getOwnPropertyDescriptor(Element.prototype, 'firstElementChild').get;
const lastElementChildGetter = getOwnPropertyDescriptor(Element.prototype, 'lastElementChild').get;
const innerTextDescriptor = getOwnPropertyDescriptor(HTMLElement.prototype, 'innerText');
const innerTextGetter = innerTextDescriptor
    ? innerTextDescriptor.get
    : null;
const innerTextSetter = innerTextDescriptor
    ? innerTextDescriptor.set
    : null;
// Note: Firefox does not have outerText, https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/outerText
const outerTextDescriptor = getOwnPropertyDescriptor(HTMLElement.prototype, 'outerText');
const outerTextGetter = outerTextDescriptor
    ? outerTextDescriptor.get
    : null;
const outerTextSetter = outerTextDescriptor
    ? outerTextDescriptor.set
    : null;
const innerHTMLDescriptor = getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
const innerHTMLGetter = innerHTMLDescriptor.get;
const innerHTMLSetter = innerHTMLDescriptor.set;
const outerHTMLDescriptor = getOwnPropertyDescriptor(Element.prototype, 'outerHTML');
const outerHTMLGetter = outerHTMLDescriptor.get;
const outerHTMLSetter = outerHTMLDescriptor.set;
const tagNameGetter = getOwnPropertyDescriptor(Element.prototype, 'tagName').get;
const tabIndexDescriptor = getOwnPropertyDescriptor(HTMLElement.prototype, 'tabIndex');
const tabIndexGetter = tabIndexDescriptor.get;
const tabIndexSetter = tabIndexDescriptor.set;
const matches = Element.prototype.matches;
const childrenGetter = getOwnPropertyDescriptor(Element.prototype, 'children').get;
// for IE11, access from HTMLElement
// for all other browsers access the method from the parent Element interface
const { getElementsByClassName: getElementsByClassName$1 } = HTMLElement.prototype;
const shadowRootGetter = hasOwnProperty.call(Element.prototype, 'shadowRoot')
    ? getOwnPropertyDescriptor(Element.prototype, 'shadowRoot').get
    : () => null;
const assignedSlotGetter$1 = hasOwnProperty.call(Element.prototype, 'assignedSlot')
    ? getOwnPropertyDescriptor(Element.prototype, 'assignedSlot').get
    : () => null;

/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assignedNodes = HTMLSlotElement.prototype.assignedNodes;
const assignedElements = HTMLSlotElement.prototype.assignedElements;

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const eventTargetGetter = getOwnPropertyDescriptor(Event.prototype, 'target').get;
const eventCurrentTargetGetter = getOwnPropertyDescriptor(Event.prototype, 'currentTarget').get;
const focusEventRelatedTargetGetter = getOwnPropertyDescriptor(FocusEvent.prototype, 'relatedTarget').get;
// IE does not implement composedPath() but that's ok because we only use this instead of our
// composedPath() polyfill when dealing with native shadow DOM components in mixed mode. Defaulting
// to a NOOP just to be safe, even though this is almost guaranteed to be defined such a scenario.
const composedPath = hasOwnProperty.call(Event.prototype, 'composedPath')
    ? Event.prototype.composedPath
    : () => [];

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const DocumentPrototypeActiveElement = getOwnPropertyDescriptor(Document.prototype, 'activeElement').get;
const elementFromPoint = Document.prototype.elementFromPoint;
const elementsFromPoint = Document.prototype.elementsFromPoint;
// defaultView can be null when a document has no browsing context. For example, the owner document
// of a node in a template doesn't have a default view: https://jsfiddle.net/hv9z0q5a/
const defaultViewGetter = getOwnPropertyDescriptor(Document.prototype, 'defaultView').get;
const { querySelectorAll, getElementById, getElementsByClassName, getElementsByTagName, getElementsByTagNameNS, } = Document.prototype;
// In Firefox v57 and lower, getElementsByName is defined on HTMLDocument.prototype
// In all other browsers have the method on Document.prototype
const { getElementsByName } = HTMLDocument.prototype;

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { addEventListener: windowAddEventListener, removeEventListener: windowRemoveEventListener} = window;

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// There is code in the polyfills that requires access to the unpatched
// Mutation Observer constructor, this the code for that.
// Eventually, the polyfill should uses the patched version, and this file can be removed.
const MO = MutationObserver;
const MutationObserverObserve = MO.prototype.observe;

/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// Capture the global `ShadowRoot` since synthetic shadow will override it later
const NativeShadowRoot = ShadowRoot;
const isInstanceOfNativeShadowRoot = (node) => node instanceof NativeShadowRoot;

/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const eventTargetPrototype = EventTarget.prototype;
const { addEventListener, dispatchEvent, removeEventListener } = eventTargetPrototype;

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// Used as a back reference to identify the host element
const HostElementKey = '$$HostElementKey$$';
const ShadowedNodeKey = '$$ShadowedNodeKey$$';
function fastDefineProperty(node, propName, config) {
    const shadowedNode = node;
    if (process.env.NODE_ENV !== 'production') {
        // in dev, we are more restrictive
        defineProperty(shadowedNode, propName, config);
    }
    else {
        const { value } = config;
        // in prod, we prioritize performance
        shadowedNode[propName] = value;
    }
}
function setNodeOwnerKey(node, value) {
    fastDefineProperty(node, HostElementKey, { value, configurable: true });
}
function setNodeKey(node, value) {
    fastDefineProperty(node, ShadowedNodeKey, { value });
}
function getNodeOwnerKey(node) {
    return node[HostElementKey];
}
function getNodeNearestOwnerKey(node) {
    let host = node;
    let hostKey;
    // search for the first element with owner identity
    // in case of manually inserted elements and elements slotted from Light DOM
    while (!isNull(host)) {
        hostKey = getNodeOwnerKey(host);
        if (!isUndefined(hostKey)) {
            return hostKey;
        }
        host = parentNodeGetter.call(host);
        // Elements slotted from top level light DOM into synthetic shadow
        // reach the slot tag from the shadow element first
        if (!isNull(host) && isSyntheticSlotElement(host)) {
            return undefined;
        }
    }
}
function getNodeKey(node) {
    return node[ShadowedNodeKey];
}
/**
 * This function does not traverse up for performance reasons, but is sufficient for most use
 * cases. If we need to traverse up and verify those nodes that don't have owner key, use
 * isNodeDeepShadowed instead.
 * @param node
 */
function isNodeShadowed(node) {
    return !isUndefined(getNodeOwnerKey(node));
}

/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// when finding a slot in the DOM, we can fold it if it is contained
// inside another slot.
function foldSlotElement(slot) {
    let parent = parentElementGetter.call(slot);
    while (!isNull(parent) && isSlotElement(parent)) {
        slot = parent;
        parent = parentElementGetter.call(slot);
    }
    return slot;
}
function isNodeSlotted(host, node) {
    if (process.env.NODE_ENV !== 'production') {
        if (!(host instanceof HTMLElement)) {
            // eslint-disable-next-line no-console
            console.error(`isNodeSlotted() should be called with a host as the first argument`);
        }
        if (!(node instanceof _Node)) {
            // eslint-disable-next-line no-console
            console.error(`isNodeSlotted() should be called with a node as the second argument`);
        }
        if (!(compareDocumentPosition.call(node, host) & DOCUMENT_POSITION_CONTAINS)) {
            // eslint-disable-next-line no-console
            console.error(`isNodeSlotted() should never be called with a node that is not a child node of the given host`);
        }
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
        }
        else if (parent === host) {
            return false;
        }
        else if (!isNull(parent) && getNodeNearestOwnerKey(parent) !== elmOwnerKey) {
            // we are crossing a boundary of some sort since the elm and its parent
            // have different owner key. for slotted elements, this is possible
            // if the parent happens to be a slot.
            if (isSlotElement(parent)) {
                /*
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
                currentElement = getNodeOwner(foldSlotElement(parent));
                if (!isNull(currentElement)) {
                    if (currentElement === host) {
                        // the slot element is a top level element inside the shadow
                        // of a host that was allocated into host in question
                        return true;
                    }
                    else if (getNodeNearestOwnerKey(currentElement) === hostKey) {
                        // the slot element is an element inside the shadow
                        // of a host that was allocated into host in question
                        return true;
                    }
                }
            }
            else {
                return false;
            }
        }
        else {
            currentElement = parent;
        }
    }
    return false;
}
function getNodeOwner(node) {
    if (!(node instanceof _Node)) {
        return null;
    }
    const ownerKey = getNodeNearestOwnerKey(node);
    if (isUndefined(ownerKey)) {
        return null;
    }
    let nodeOwner = node;
    // At this point, node is a valid node with owner identity, now we need to find the owner node
    // search for a custom element with a VM that owns the first element with owner identity attached to it
    while (!isNull(nodeOwner) && getNodeKey(nodeOwner) !== ownerKey) {
        nodeOwner = parentNodeGetter.call(nodeOwner);
    }
    if (isNull(nodeOwner)) {
        return null;
    }
    return nodeOwner;
}
function isSyntheticSlotElement(node) {
    return isSlotElement(node) && isNodeShadowed(node);
}
function isSlotElement(node) {
    return node instanceof HTMLSlotElement;
}
function isNodeOwnedBy(owner, node) {
    if (process.env.NODE_ENV !== 'production') {
        if (!(owner instanceof HTMLElement)) {
            // eslint-disable-next-line no-console
            console.error(`isNodeOwnedBy() should be called with an element as the first argument`);
        }
        if (!(node instanceof _Node)) {
            // eslint-disable-next-line no-console
            console.error(`isNodeOwnedBy() should be called with a node as the second argument`);
        }
        if (!(compareDocumentPosition.call(node, owner) & DOCUMENT_POSITION_CONTAINS)) {
            // eslint-disable-next-line no-console
            console.error(`isNodeOwnedBy() should never be called with a node that is not a child node of of the given owner`);
        }
    }
    const ownerKey = getNodeNearestOwnerKey(node);
    if (isUndefined(ownerKey)) {
        // in case of root level light DOM element slotting into a synthetic shadow
        const host = parentNodeGetter.call(node);
        if (!isNull(host) && isSyntheticSlotElement(host)) {
            return false;
        }
        // in case of manually inserted elements
        return true;
    }
    return getNodeKey(owner) === ownerKey;
}
function shadowRootChildNodes(root) {
    const elm = getHost(root);
    return getAllMatches(elm, arrayFromCollection(childNodesGetter.call(elm)));
}
function getAllSlottedMatches(host, nodeList) {
    const filteredAndPatched = [];
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        const node = nodeList[i];
        if (!isNodeOwnedBy(host, node) && isNodeSlotted(host, node)) {
            ArrayPush.call(filteredAndPatched, node);
        }
    }
    return filteredAndPatched;
}
function getFirstSlottedMatch(host, nodeList) {
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        const node = nodeList[i];
        if (!isNodeOwnedBy(host, node) && isNodeSlotted(host, node)) {
            return node;
        }
    }
    return null;
}
function getAllMatches(owner, nodeList) {
    const filteredAndPatched = [];
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        const node = nodeList[i];
        const isOwned = isNodeOwnedBy(owner, node);
        if (isOwned) {
            // Patch querySelector, querySelectorAll, etc
            // if element is owned by VM
            ArrayPush.call(filteredAndPatched, node);
        }
    }
    return filteredAndPatched;
}
function getFirstMatch(owner, nodeList) {
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        if (isNodeOwnedBy(owner, nodeList[i])) {
            return nodeList[i];
        }
    }
    return null;
}
function shadowRootQuerySelector(root, selector) {
    const elm = getHost(root);
    const nodeList = arrayFromCollection(querySelectorAll$1.call(elm, selector));
    return getFirstMatch(elm, nodeList);
}
function shadowRootQuerySelectorAll(root, selector) {
    const elm = getHost(root);
    const nodeList = querySelectorAll$1.call(elm, selector);
    return getAllMatches(elm, arrayFromCollection(nodeList));
}
function getFilteredChildNodes(node) {
    if (!isSyntheticShadowHost(node) && !isSlotElement(node)) {
        // regular element - fast path
        const children = childNodesGetter.call(node);
        return arrayFromCollection(children);
    }
    if (isSyntheticShadowHost(node)) {
        // we need to get only the nodes that were slotted
        const slots = arrayFromCollection(querySelectorAll$1.call(node, 'slot'));
        const resolver = getShadowRootResolver(getShadowRoot(node));
        return ArrayReduce.call(slots, 
        // @ts-expect-error Array#reduce has a generic that gets lost in our retyped ArrayReduce
        (seed, slot) => {
            if (resolver === getShadowRootResolver(slot)) {
                ArrayPush.apply(seed, getFilteredSlotAssignedNodes(slot));
            }
            return seed;
        }, []);
    }
    else {
        // slot element
        const children = arrayFromCollection(childNodesGetter.call(node));
        const resolver = getShadowRootResolver(node);
        return ArrayFilter.call(children, (child) => resolver === getShadowRootResolver(child));
    }
}
function getFilteredSlotAssignedNodes(slot) {
    const owner = getNodeOwner(slot);
    if (isNull(owner)) {
        return [];
    }
    const childNodes = arrayFromCollection(childNodesGetter.call(slot));
    return ArrayFilter.call(childNodes, (child) => !isNodeShadowed(child) || !isNodeOwnedBy(owner, child));
}

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
// This code is inspired by Polymer ShadyDOM Polyfill
function getInnerHTML(node) {
    let s = '';
    const childNodes = getFilteredChildNodes(node);
    for (let i = 0, len = childNodes.length; i < len; i += 1) {
        s += getOuterHTML(childNodes[i]);
    }
    return s;
}

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
// This code is inspired by Polymer ShadyDOM Polyfill
// http://www.whatwg.org/specs/web-apps/current-work/multipage/the-end.html#escapingString
const escapeAttrRegExp = /[&\u00A0"]/g;
const escapeDataRegExp = /[&\u00A0<>]/g;
const { replace, toLowerCase } = String.prototype;
function escapeReplace(c) {
    switch (c) {
        case '&':
            return '&amp;';
        case '<':
            return '&lt;';
        case '>':
            return '&gt;';
        case '"':
            return '&quot;';
        case '\u00A0':
            return '&nbsp;';
        default:
            return '';
    }
}
function escapeAttr(s) {
    return replace.call(s, escapeAttrRegExp, escapeReplace);
}
function escapeData(s) {
    return replace.call(s, escapeDataRegExp, escapeReplace);
}
// http://www.whatwg.org/specs/web-apps/current-work/#void-elements
const voidElements = new Set([
    'AREA',
    'BASE',
    'BR',
    'COL',
    'COMMAND',
    'EMBED',
    'HR',
    'IMG',
    'INPUT',
    'KEYGEN',
    'LINK',
    'META',
    'PARAM',
    'SOURCE',
    'TRACK',
    'WBR',
]);
const plaintextParents = new Set([
    'STYLE',
    'SCRIPT',
    'XMP',
    'IFRAME',
    'NOEMBED',
    'NOFRAMES',
    'PLAINTEXT',
    'NOSCRIPT',
]);
function getOuterHTML(node) {
    switch (node.nodeType) {
        case ELEMENT_NODE: {
            const { attributes: attrs } = node;
            const tagName = tagNameGetter.call(node);
            let s = '<' + toLowerCase.call(tagName);
            for (let i = 0, attr; (attr = attrs[i]); i++) {
                s += ' ' + attr.name + '="' + escapeAttr(attr.value) + '"';
            }
            s += '>';
            if (voidElements.has(tagName)) {
                return s;
            }
            return s + getInnerHTML(node) + '</' + toLowerCase.call(tagName) + '>';
        }
        case TEXT_NODE: {
            const { data, parentNode } = node;
            if (parentNode instanceof Element &&
                plaintextParents.has(tagNameGetter.call(parentNode))) {
                return data;
            }
            return escapeData(data);
        }
        case CDATA_SECTION_NODE: {
            return `<!CDATA[[${node.data}]]>`;
        }
        case PROCESSING_INSTRUCTION_NODE: {
            return `<?${node.target} ${node.data}?>`;
        }
        case COMMENT_NODE: {
            return `<!--${node.data}-->`;
        }
        default: {
            // intentionally ignoring unknown node types
            // Note: since this routine is always invoked for childNodes
            // we can safety ignore type 9, 10 and 99 (document, fragment and doctype)
            return '';
        }
    }
}

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
// This code is inspired by Polymer ShadyDOM Polyfill
function getTextContent(node) {
    switch (node.nodeType) {
        case ELEMENT_NODE: {
            const childNodes = getFilteredChildNodes(node);
            let content = '';
            for (let i = 0, len = childNodes.length; i < len; i += 1) {
                const currentNode = childNodes[i];
                if (currentNode.nodeType !== COMMENT_NODE) {
                    content += getTextContent(currentNode);
                }
            }
            return content;
        }
        default:
            return node.nodeValue;
    }
}

/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const Items$1 = new WeakMap();
function StaticNodeList() {
    throw new TypeError('Illegal constructor');
}
StaticNodeList.prototype = create(NodeList.prototype, {
    constructor: {
        writable: true,
        configurable: true,
        value: StaticNodeList,
    },
    item: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(index) {
            return this[index];
        },
    },
    length: {
        enumerable: true,
        configurable: true,
        get() {
            return Items$1.get(this).length;
        },
    },
    // Iterator protocol
    forEach: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(cb, thisArg) {
            forEach.call(Items$1.get(this), cb, thisArg);
        },
    },
    entries: {
        writable: true,
        enumerable: true,
        configurable: true,
        value() {
            return ArrayMap.call(Items$1.get(this), (v, i) => [i, v]);
        },
    },
    keys: {
        writable: true,
        enumerable: true,
        configurable: true,
        value() {
            return ArrayMap.call(Items$1.get(this), (_v, i) => i);
        },
    },
    values: {
        writable: true,
        enumerable: true,
        configurable: true,
        value() {
            return Items$1.get(this);
        },
    },
    [Symbol.iterator]: {
        writable: true,
        configurable: true,
        value() {
            let nextIndex = 0;
            return {
                next: () => {
                    const items = Items$1.get(this);
                    return nextIndex < items.length
                        ? {
                            value: items[nextIndex++],
                            done: false,
                        }
                        : {
                            done: true,
                        };
                },
            };
        },
    },
    [Symbol.toStringTag]: {
        configurable: true,
        get() {
            return 'NodeList';
        },
    },
    // IE11 doesn't support Symbol.toStringTag, in which case we
    // provide the regular toString method.
    toString: {
        writable: true,
        configurable: true,
        value() {
            return '[object NodeList]';
        },
    },
});
// prototype inheritance dance
setPrototypeOf(StaticNodeList, NodeList);
function createStaticNodeList(items) {
    const nodeList = create(StaticNodeList.prototype);
    Items$1.set(nodeList, items);
    // setting static indexes
    forEach.call(items, (item, index) => {
        defineProperty(nodeList, index, {
            value: item,
            enumerable: true,
            configurable: true,
        });
    });
    return nodeList;
}

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// Walk up the DOM tree, collecting all shadow roots plus the document root
function getAllRootNodes(node) {
    const rootNodes = [];
    let currentRootNode = node.getRootNode();
    while (!isUndefined(currentRootNode)) {
        rootNodes.push(currentRootNode);
        currentRootNode = currentRootNode.host?.getRootNode();
    }
    return rootNodes;
}
// Keep searching up the host tree until we find an element that is within the immediate shadow root
const findAncestorHostInImmediateShadowRoot = (rootNode, targetRootNode) => {
    let host;
    while (!isUndefined((host = rootNode.host))) {
        const thisRootNode = host.getRootNode();
        if (thisRootNode === targetRootNode) {
            return host;
        }
        rootNode = thisRootNode;
    }
};
function fauxElementsFromPoint(context, doc, left, top) {
    const elements = elementsFromPoint.call(doc, left, top);
    const result = [];
    const rootNodes = getAllRootNodes(context);
    // Filter the elements array to only include those elements that are in this shadow root or in one of its
    // ancestor roots. This matches Chrome and Safari's implementation (but not Firefox's, which only includes
    // elements in the immediate shadow root: https://crbug.com/1207863#c4).
    if (!isNull(elements)) {
        // can be null in IE https://developer.mozilla.org/en-US/docs/Web/API/Document/elementsFromPoint#browser_compatibility
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (isSyntheticSlotElement(element)) {
                continue;
            }
            const elementRootNode = element.getRootNode();
            if (ArrayIndexOf.call(rootNodes, elementRootNode) !== -1) {
                ArrayPush.call(result, element);
                continue;
            }
            // In cases where the host element is not visible but its shadow descendants are, then
            // we may get the shadow descendant instead of the host element here. (The
            // browser doesn't know the difference in synthetic shadow DOM.)
            // In native shadow DOM, however, elementsFromPoint would return the host but not
            // the child. So we need to detect if this shadow element's host is accessible from
            // the context's shadow root. Note we also need to be careful not to add the host
            // multiple times.
            const ancestorHost = findAncestorHostInImmediateShadowRoot(elementRootNode, rootNodes[0]);
            if (!isUndefined(ancestorHost) &&
                ArrayIndexOf.call(elements, ancestorHost) === -1 &&
                ArrayIndexOf.call(result, ancestorHost) === -1) {
                ArrayPush.call(result, ancestorHost);
            }
        }
    }
    return result;
}

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const Items = new WeakMap();
function StaticHTMLCollection() {
    throw new TypeError('Illegal constructor');
}
StaticHTMLCollection.prototype = create(HTMLCollection.prototype, {
    constructor: {
        writable: true,
        configurable: true,
        value: StaticHTMLCollection,
    },
    item: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(index) {
            return this[index];
        },
    },
    length: {
        enumerable: true,
        configurable: true,
        get() {
            return Items.get(this).length;
        },
    },
    // https://dom.spec.whatwg.org/#dom-htmlcollection-nameditem-key
    namedItem: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(name) {
            if (name === '') {
                return null;
            }
            const items = Items.get(this);
            for (let i = 0, len = items.length; i < len; i++) {
                const item = items[len];
                if (name === getAttribute.call(item, 'id') ||
                    name === getAttribute.call(item, 'name')) {
                    return item;
                }
            }
            return null;
        },
    },
    [Symbol.toStringTag]: {
        configurable: true,
        get() {
            return 'HTMLCollection';
        },
    },
    // IE11 doesn't support Symbol.toStringTag, in which case we
    // provide the regular toString method.
    toString: {
        writable: true,
        configurable: true,
        value() {
            return '[object HTMLCollection]';
        },
    },
});
// prototype inheritance dance
setPrototypeOf(StaticHTMLCollection, HTMLCollection);
function createStaticHTMLCollection(items) {
    const collection = create(StaticHTMLCollection.prototype);
    Items.set(collection, items);
    // setting static indexes
    forEach.call(items, (item, index) => {
        defineProperty(collection, index, {
            value: item,
            enumerable: true,
            configurable: true,
        });
    });
    return collection;
}

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
 * This method checks whether or not the content of the node is computed
 * based on the light-dom slotting mechanism. This applies to synthetic slot elements
 * and elements with shadow dom attached to them. It doesn't apply to native slot elements
 * because we don't want to patch the children getters for those elements.
 * @param node
 */
function hasMountedChildren(node) {
    return isSyntheticSlotElement(node) || isSyntheticShadowHost(node);
}
function getShadowParent(node, value) {
    const owner = getNodeOwner(node);
    if (value === owner) {
        // walking up via parent chain might end up in the shadow root element
        return getShadowRoot(owner);
    }
    else if (value instanceof Element) {
        if (getNodeNearestOwnerKey(node) === getNodeNearestOwnerKey(value)) {
            // the element and its parent node belong to the same shadow root
            return value;
        }
        else if (!isNull(owner) && isSlotElement(value)) {
            // slotted elements must be top level childNodes of the slot element
            // where they slotted into, but its shadowed parent is always the
            // owner of the slot.
            const slotOwner = getNodeOwner(value);
            if (!isNull(slotOwner) && isNodeOwnedBy(owner, slotOwner)) {
                // it is a slotted element, and therefore its parent is always going to be the host of the slot
                return slotOwner;
            }
        }
    }
    return null;
}
function hasChildNodesPatched() {
    return getInternalChildNodes(this).length > 0;
}
function firstChildGetterPatched() {
    const childNodes = getInternalChildNodes(this);
    return childNodes[0] || null;
}
function lastChildGetterPatched() {
    const childNodes = getInternalChildNodes(this);
    return childNodes[childNodes.length - 1] || null;
}
function textContentGetterPatched() {
    return getTextContent(this);
}
function textContentSetterPatched(value) {
    textContextSetter.call(this, value);
}
function parentNodeGetterPatched() {
    const value = parentNodeGetter.call(this);
    if (isNull(value)) {
        return value;
    }
    // TODO [#1635]: this needs optimization, maybe implementing it based on this.assignedSlot
    return getShadowParent(this, value);
}
function parentElementGetterPatched() {
    const value = parentNodeGetter.call(this);
    if (isNull(value)) {
        return null;
    }
    const parentNode = getShadowParent(this, value);
    // it could be that the parentNode is the shadowRoot, in which case
    // we need to return null.
    // TODO [#1635]: this needs optimization, maybe implementing it based on this.assignedSlot
    return parentNode instanceof Element ? parentNode : null;
}
function compareDocumentPositionPatched(otherNode) {
    if (this === otherNode) {
        return 0;
    }
    else if (this.getRootNode() === otherNode) {
        // "this" is in a shadow tree where the shadow root is the "otherNode".
        return 10; // Node.DOCUMENT_POSITION_CONTAINS | Node.DOCUMENT_POSITION_PRECEDING
    }
    else if (getNodeOwnerKey(this) !== getNodeOwnerKey(otherNode)) {
        // "this" and "otherNode" belongs to 2 different shadow tree.
        return 35; // Node.DOCUMENT_POSITION_DISCONNECTED | Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC | Node.DOCUMENT_POSITION_PRECEDING
    }
    // Since "this" and "otherNode" are part of the same shadow tree we can safely rely to the native
    // Node.compareDocumentPosition implementation.
    return compareDocumentPosition.call(this, otherNode);
}
function containsPatched(otherNode) {
    if (otherNode == null || getNodeOwnerKey(this) !== getNodeOwnerKey(otherNode)) {
        // it is from another shadow
        return false;
    }
    return (compareDocumentPosition.call(this, otherNode) & DOCUMENT_POSITION_CONTAINED_BY) !== 0;
}
function cloneNodePatched(deep) {
    const clone = cloneNode.call(this, false);
    // Per spec, browsers only care about truthy values
    // Not strict true or false
    if (!deep) {
        return clone;
    }
    const childNodes = getInternalChildNodes(this);
    for (let i = 0, len = childNodes.length; i < len; i += 1) {
        clone.appendChild(childNodes[i].cloneNode(true));
    }
    return clone;
}
/**
 * This method only applies to elements with a shadow or slots
 */
function childNodesGetterPatched() {
    if (isSyntheticShadowHost(this)) {
        const owner = getNodeOwner(this);
        const filteredChildNodes = getFilteredChildNodes(this);
        // No need to filter by owner for non-shadowed nodes
        const childNodes = isNull(owner)
            ? filteredChildNodes
            : getAllMatches(owner, filteredChildNodes);
        return createStaticNodeList(childNodes);
    }
    // nothing to do here since this does not have a synthetic shadow attached to it
    // TODO [#1636]: what about slot elements?
    return childNodesGetter.call(this);
}
const nativeGetRootNode = _Node.prototype.getRootNode;
/**
 * Get the root by climbing up the dom tree, beyond the shadow root
 * If Node.prototype.getRootNode is supported, use it
 * else, assume we are working in non-native shadow mode and climb using parentNode
 */
const getDocumentOrRootNode = !isUndefined(nativeGetRootNode)
    ? nativeGetRootNode
    : function () {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let node = this;
        let nodeParent;
        while (!isNull((nodeParent = parentNodeGetter.call(node)))) {
            node = nodeParent;
        }
        return node;
    };
/**
 * Get the shadow root
 * getNodeOwner() returns the host element that owns the given node
 * Note: getNodeOwner() returns null when running in native-shadow mode.
 * Fallback to using the native getRootNode() to discover the root node.
 * This is because, it is not possible to inspect the node and decide if it is part
 * of a native shadow or the synthetic shadow.
 * @param node
 */
function getNearestRoot(node) {
    const ownerNode = getNodeOwner(node);
    if (isNull(ownerNode)) {
        // we hit a wall, either we are in native shadow mode or the node is not in lwc boundary.
        return getDocumentOrRootNode.call(node);
    }
    return getShadowRoot(ownerNode);
}
/**
 * If looking for a root node beyond shadow root by calling `node.getRootNode({composed: true})`, use the original `Node.prototype.getRootNode` method
 * to return the root of the dom tree. In IE11 and Edge, Node.prototype.getRootNode is
 * [not supported](https://developer.mozilla.org/en-US/docs/Web/API/Node/getRootNode#Browser_compatibility). The root node is discovered by manually
 * climbing up the dom tree.
 *
 * If looking for a shadow root of a node by calling `node.getRootNode({composed: false})` or `node.getRootNode()`,
 *
 * 1. Try to identify the host element that owns the give node.
 * i. Identify the shadow tree that the node belongs to
 * ii. If the node belongs to a shadow tree created by engine, return the shadowRoot of the host element that owns the shadow tree
 * 2. The host identification logic returns null in two cases:
 * i. The node does not belong to a shadow tree created by engine
 * ii. The engine is running in native shadow dom mode
 * If so, use the original Node.prototype.getRootNode to fetch the root node(or manually climb up the dom tree where getRootNode() is unsupported)
 *
 * _Spec_: https://dom.spec.whatwg.org/#dom-node-getrootnode
 * @param options
 */
function getRootNodePatched(options) {
    const composed = isUndefined(options) ? false : !!options.composed;
    return isTrue(composed) ? getDocumentOrRootNode.call(this, options) : getNearestRoot(this);
}
// Non-deep-traversing patches: this descriptor map includes all descriptors that
// do not give access to nodes beyond the immediate children.
defineProperties(_Node.prototype, {
    firstChild: {
        get() {
            if (hasMountedChildren(this)) {
                return firstChildGetterPatched.call(this);
            }
            return firstChildGetter.call(this);
        },
        enumerable: true,
        configurable: true,
    },
    lastChild: {
        get() {
            if (hasMountedChildren(this)) {
                return lastChildGetterPatched.call(this);
            }
            return lastChildGetter.call(this);
        },
        enumerable: true,
        configurable: true,
    },
    textContent: {
        get() {
            // Note: we deviate from native shadow here, but are not fixing
            // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
            if (isNodeShadowed(this) || isSyntheticShadowHost(this)) {
                return textContentGetterPatched.call(this);
            }
            return textContentGetter.call(this);
        },
        set: textContentSetterPatched,
        enumerable: true,
        configurable: true,
    },
    parentNode: {
        get() {
            if (isNodeShadowed(this)) {
                return parentNodeGetterPatched.call(this);
            }
            const parentNode = parentNodeGetter.call(this);
            // Handle the case where a top level light DOM element is slotted into a synthetic
            // shadow slot.
            if (!isNull(parentNode) && isSyntheticSlotElement(parentNode)) {
                return getNodeOwner(parentNode);
            }
            return parentNode;
        },
        enumerable: true,
        configurable: true,
    },
    parentElement: {
        get() {
            if (isNodeShadowed(this)) {
                return parentElementGetterPatched.call(this);
            }
            const parentElement = parentElementGetter.call(this);
            // Handle the case where a top level light DOM element is slotted into a synthetic
            // shadow slot.
            if (!isNull(parentElement) && isSyntheticSlotElement(parentElement)) {
                return getNodeOwner(parentElement);
            }
            return parentElement;
        },
        enumerable: true,
        configurable: true,
    },
    childNodes: {
        get() {
            if (hasMountedChildren(this)) {
                return childNodesGetterPatched.call(this);
            }
            return childNodesGetter.call(this);
        },
        enumerable: true,
        configurable: true,
    },
    hasChildNodes: {
        value() {
            if (hasMountedChildren(this)) {
                return hasChildNodesPatched.call(this);
            }
            return hasChildNodes.call(this);
        },
        enumerable: true,
        writable: true,
        configurable: true,
    },
    compareDocumentPosition: {
        value(otherNode) {
            // Note: we deviate from native shadow here, but are not fixing
            // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
            if (isGlobalPatchingSkipped(this)) {
                return compareDocumentPosition.call(this, otherNode);
            }
            return compareDocumentPositionPatched.call(this, otherNode);
        },
        enumerable: true,
        writable: true,
        configurable: true,
    },
    contains: {
        value(otherNode) {
            // 1. Node.prototype.contains() returns true if otherNode is an inclusive descendant
            //    spec: https://dom.spec.whatwg.org/#dom-node-contains
            // 2. This normalizes the behavior of this api across all browsers.
            //    In IE11, a disconnected dom element without children invoking contains() on self, returns false
            if (this === otherNode) {
                return true;
            }
            // Note: we deviate from native shadow here, but are not fixing
            // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
            if (otherNode == null) {
                return false;
            }
            if (isNodeShadowed(this) || isSyntheticShadowHost(this)) {
                return containsPatched.call(this, otherNode);
            }
            return contains.call(this, otherNode);
        },
        enumerable: true,
        writable: true,
        configurable: true,
    },
    cloneNode: {
        value(deep) {
            // Note: we deviate from native shadow here, but are not fixing
            // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
            if (isNodeShadowed(this) || isSyntheticShadowHost(this)) {
                return cloneNodePatched.call(this, deep);
            }
            return cloneNode.call(this, deep);
        },
        enumerable: true,
        writable: true,
        configurable: true,
    },
    getRootNode: {
        value: getRootNodePatched,
        enumerable: true,
        configurable: true,
        writable: true,
    },
    isConnected: {
        enumerable: true,
        configurable: true,
        get() {
            return isConnected.call(this);
        },
    },
});
const getInternalChildNodes = function (node) {
    return node.childNodes;
};
// IE11 extra patches for wrong prototypes
if (hasOwnProperty.call(HTMLElement.prototype, 'contains')) {
    defineProperty(HTMLElement.prototype, 'contains', getOwnPropertyDescriptor(_Node.prototype, 'contains'));
}
if (hasOwnProperty.call(HTMLElement.prototype, 'parentElement')) {
    defineProperty(HTMLElement.prototype, 'parentElement', getOwnPropertyDescriptor(_Node.prototype, 'parentElement'));
}

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const EventListenerMap = new WeakMap();
const ComposedPathMap = new WeakMap();
function isEventListenerOrEventListenerObject$1(fnOrObj) {
    return (isFunction(fnOrObj) ||
        (isObject(fnOrObj) &&
            !isNull(fnOrObj) &&
            isFunction(fnOrObj.handleEvent)));
}
function shouldInvokeListener(event, target, currentTarget) {
    // Subsequent logic assumes that `currentTarget` must be contained in the composed path for the listener to be
    // invoked, but this is not always the case. `composedPath()` will sometimes return an empty array, even when the
    // listener should be invoked (e.g., a disconnected instance of EventTarget, an instance of XMLHttpRequest, etc).
    if (target === currentTarget) {
        return true;
    }
    let composedPath = ComposedPathMap.get(event);
    if (isUndefined(composedPath)) {
        composedPath = event.composedPath();
        ComposedPathMap.set(event, composedPath);
    }
    return composedPath.includes(currentTarget);
}
function getEventListenerWrapper(fnOrObj) {
    if (!isEventListenerOrEventListenerObject$1(fnOrObj)) {
        return fnOrObj;
    }
    let wrapperFn = EventListenerMap.get(fnOrObj);
    if (isUndefined(wrapperFn)) {
        wrapperFn = function (event) {
            // This function is invoked from an event listener and currentTarget is always defined.
            const currentTarget = eventCurrentTargetGetter.call(event);
            if (process.env.NODE_ENV !== 'production') {
                assert.invariant(isFalse(isSyntheticShadowHost(currentTarget)), 'This routine should not be used to wrap event listeners for host elements and shadow roots.');
            }
            const actualTarget = getActualTarget(event);
            if (!shouldInvokeListener(event, actualTarget, currentTarget)) {
                return;
            }
            return isFunction(fnOrObj)
                ? fnOrObj.call(this, event)
                : fnOrObj.handleEvent && fnOrObj.handleEvent(event);
        };
        EventListenerMap.set(fnOrObj, wrapperFn);
    }
    return wrapperFn;
}

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const eventToContextMap = new WeakMap();
function getEventHandler(listener) {
    if (isFunction(listener)) {
        return listener;
    }
    else {
        return listener.handleEvent;
    }
}
function isEventListenerOrEventListenerObject(listener) {
    return isFunction(listener) || isFunction(listener?.handleEvent);
}
const customElementToWrappedListeners = new WeakMap();
function getEventMap(elm) {
    let listenerInfo = customElementToWrappedListeners.get(elm);
    if (isUndefined(listenerInfo)) {
        listenerInfo = create(null);
        customElementToWrappedListeners.set(elm, listenerInfo);
    }
    return listenerInfo;
}
/**
 * Events dispatched on shadow roots actually end up being dispatched on their hosts. This means that the event.target
 * property of events dispatched on shadow roots always resolve to their host. This function understands this
 * abstraction and properly returns a reference to the shadow root when appropriate.
 * @param event
 */
function getActualTarget(event) {
    return eventToShadowRootMap.get(event) ?? eventTargetGetter.call(event);
}
const shadowRootEventListenerMap = new WeakMap();
function getManagedShadowRootListener(listener) {
    if (!isEventListenerOrEventListenerObject(listener)) {
        throw new TypeError(); // avoiding problems with non-valid listeners
    }
    let managedListener = shadowRootEventListenerMap.get(listener);
    if (isUndefined(managedListener)) {
        managedListener = {
            identity: listener,
            placement: 1 /* EventListenerContext.SHADOW_ROOT_LISTENER */,
            handleEvent(event) {
                // currentTarget is always defined inside an event listener
                let currentTarget = eventCurrentTargetGetter.call(event);
                // If currentTarget is not an instance of a native shadow root then we're dealing with a
                // host element whose synthetic shadow root must be accessed via getShadowRoot().
                if (!isInstanceOfNativeShadowRoot(currentTarget)) {
                    currentTarget = getShadowRoot(currentTarget);
                }
                const actualTarget = getActualTarget(event);
                if (shouldInvokeListener(event, actualTarget, currentTarget)) {
                    getEventHandler(listener).call(currentTarget, event);
                }
            },
        };
        shadowRootEventListenerMap.set(listener, managedListener);
    }
    return managedListener;
}
const customElementEventListenerMap = new WeakMap();
function getManagedCustomElementListener(listener) {
    if (!isEventListenerOrEventListenerObject(listener)) {
        throw new TypeError(); // avoiding problems with non-valid listeners
    }
    let managedListener = customElementEventListenerMap.get(listener);
    if (isUndefined(managedListener)) {
        managedListener = {
            identity: listener,
            placement: 0 /* EventListenerContext.CUSTOM_ELEMENT_LISTENER */,
            handleEvent(event) {
                // currentTarget is always defined inside an event listener
                const currentTarget = eventCurrentTargetGetter.call(event);
                const actualTarget = getActualTarget(event);
                if (shouldInvokeListener(event, actualTarget, currentTarget)) {
                    getEventHandler(listener).call(currentTarget, event);
                }
            },
        };
        customElementEventListenerMap.set(listener, managedListener);
    }
    return managedListener;
}
function indexOfManagedListener(listeners, listener) {
    return ArrayFindIndex.call(listeners, (l) => l.identity === listener.identity);
}
function domListener(evt) {
    let immediatePropagationStopped = false;
    let propagationStopped = false;
    const { type, stopImmediatePropagation, stopPropagation } = evt;
    // currentTarget is always defined
    const currentTarget = eventCurrentTargetGetter.call(evt);
    const listenerMap = getEventMap(currentTarget);
    const listeners = listenerMap[type]; // it must have listeners at this point
    defineProperty(evt, 'stopImmediatePropagation', {
        value() {
            immediatePropagationStopped = true;
            stopImmediatePropagation.call(evt);
        },
        writable: true,
        enumerable: true,
        configurable: true,
    });
    defineProperty(evt, 'stopPropagation', {
        value() {
            propagationStopped = true;
            stopPropagation.call(evt);
        },
        writable: true,
        enumerable: true,
        configurable: true,
    });
    // in case a listener adds or removes other listeners during invocation
    const bookkeeping = ArraySlice.call(listeners);
    function invokeListenersByPlacement(placement) {
        forEach.call(bookkeeping, (listener) => {
            if (isFalse(immediatePropagationStopped) && listener.placement === placement) {
                // making sure that the listener was not removed from the original listener queue
                if (indexOfManagedListener(listeners, listener) !== -1) {
                    // all handlers on the custom element should be called with undefined 'this'
                    listener.handleEvent.call(undefined, evt);
                }
            }
        });
    }
    eventToContextMap.set(evt, 1 /* EventListenerContext.SHADOW_ROOT_LISTENER */);
    invokeListenersByPlacement(1 /* EventListenerContext.SHADOW_ROOT_LISTENER */);
    if (isFalse(immediatePropagationStopped) && isFalse(propagationStopped)) {
        // doing the second iteration only if the first one didn't interrupt the event propagation
        eventToContextMap.set(evt, 0 /* EventListenerContext.CUSTOM_ELEMENT_LISTENER */);
        invokeListenersByPlacement(0 /* EventListenerContext.CUSTOM_ELEMENT_LISTENER */);
    }
    eventToContextMap.set(evt, 2 /* EventListenerContext.UNKNOWN_LISTENER */);
}
function attachDOMListener(elm, type, managedListener) {
    const listenerMap = getEventMap(elm);
    let listeners = listenerMap[type];
    if (isUndefined(listeners)) {
        listeners = listenerMap[type] = [];
    }
    // Prevent identical listeners from subscribing to the same event type.
    // TODO [#1824]: Options will also play a factor in deduping if we introduce options support
    if (indexOfManagedListener(listeners, managedListener) !== -1) {
        return;
    }
    // only add to DOM if there is no other listener on the same placement yet
    if (listeners.length === 0) {
        addEventListener.call(elm, type, domListener);
    }
    ArrayPush.call(listeners, managedListener);
}
function detachDOMListener(elm, type, managedListener) {
    const listenerMap = getEventMap(elm);
    let index;
    let listeners;
    if (!isUndefined((listeners = listenerMap[type])) &&
        (index = indexOfManagedListener(listeners, managedListener)) !== -1) {
        ArraySplice.call(listeners, index, 1);
        // only remove from DOM if there is no other listener on the same placement
        if (listeners.length === 0) {
            removeEventListener.call(elm, type, domListener);
        }
    }
}
function addCustomElementEventListener(type, listener, _options) {
    if (process.env.NODE_ENV !== 'production') {
        if (!isEventListenerOrEventListenerObject(listener)) {
            throw new TypeError(`Invalid second argument for Element.addEventListener() in ${toString(this)} for event "${type}". Expected EventListener or EventListenerObject but received ${toString(listener)}.`);
        }
    }
    if (isEventListenerOrEventListenerObject(listener)) {
        const managedListener = getManagedCustomElementListener(listener);
        attachDOMListener(this, type, managedListener);
    }
}
function removeCustomElementEventListener(type, listener, _options) {
    if (isEventListenerOrEventListenerObject(listener)) {
        const managedListener = getManagedCustomElementListener(listener);
        detachDOMListener(this, type, managedListener);
    }
}
function addShadowRootEventListener(sr, type, listener, _options) {
    if (process.env.NODE_ENV !== 'production') {
        if (!isEventListenerOrEventListenerObject(listener)) {
            throw new TypeError(`Invalid second argument for ShadowRoot.addEventListener() in ${toString(sr)} for event "${type}". Expected EventListener or EventListenerObject but received ${toString(listener)}.`);
        }
    }
    if (isEventListenerOrEventListenerObject(listener)) {
        const elm = getHost(sr);
        const managedListener = getManagedShadowRootListener(listener);
        attachDOMListener(elm, type, managedListener);
    }
}
function removeShadowRootEventListener(sr, type, listener, _options) {
    if (isEventListenerOrEventListenerObject(listener)) {
        const elm = getHost(sr);
        const managedListener = getManagedShadowRootListener(listener);
        detachDOMListener(elm, type, managedListener);
    }
}

/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const InternalSlot = new WeakMap();
const { createDocumentFragment } = document;
function hasInternalSlot(root) {
    return InternalSlot.has(root);
}
function getInternalSlot(root) {
    const record = InternalSlot.get(root);
    if (isUndefined(record)) {
        throw new TypeError();
    }
    return record;
}
defineProperty(_Node.prototype, KEY__SHADOW_RESOLVER, {
    set(fn) {
        if (isUndefined(fn))
            return;
        this[KEY__SHADOW_RESOLVER_PRIVATE] = fn;
        // TODO [#1164]: temporary propagation of the key
        setNodeOwnerKey(this, fn.nodeKey);
    },
    get() {
        return this[KEY__SHADOW_RESOLVER_PRIVATE];
    },
    configurable: true,
    enumerable: true,
});
// The isUndefined check is because two copies of synthetic shadow may be loaded on the same page, and this
// would throw an error if we tried to redefine it. Plus the whole point is to expose the native method.
if (isUndefined(globalThis[KEY__NATIVE_GET_ELEMENT_BY_ID])) {
    defineProperty(globalThis, KEY__NATIVE_GET_ELEMENT_BY_ID, {
        value: getElementById,
        configurable: true,
    });
}
// See note above.
if (isUndefined(globalThis[KEY__NATIVE_QUERY_SELECTOR_ALL])) {
    defineProperty(globalThis, KEY__NATIVE_QUERY_SELECTOR_ALL, {
        value: querySelectorAll,
        configurable: true,
    });
}
function getShadowRootResolver(node) {
    return node[KEY__SHADOW_RESOLVER];
}
function setShadowRootResolver(node, fn) {
    node[KEY__SHADOW_RESOLVER] = fn;
}
function isDelegatingFocus(host) {
    return getInternalSlot(host).delegatesFocus;
}
function getHost(root) {
    return getInternalSlot(root).host;
}
function getShadowRoot(elm) {
    return getInternalSlot(elm).shadowRoot;
}
// Intentionally adding `Node` here in addition to `Element` since this check is harmless for nodes
// and we can avoid having to cast the type before calling this method in a few places.
function isSyntheticShadowHost(node) {
    const shadowRootRecord = InternalSlot.get(node);
    return !isUndefined(shadowRootRecord) && node === shadowRootRecord.host;
}
function isSyntheticShadowRoot(node) {
    const shadowRootRecord = InternalSlot.get(node);
    return !isUndefined(shadowRootRecord) && node === shadowRootRecord.shadowRoot;
}
let uid = 0;
function attachShadow(elm, options) {
    if (InternalSlot.has(elm)) {
        throw new Error(`Failed to execute 'attachShadow' on 'Element': Shadow root cannot be created on a host which already hosts a shadow tree.`);
    }
    const { mode, delegatesFocus } = options;
    // creating a real fragment for shadowRoot instance
    const doc = getOwnerDocument(elm);
    const sr = createDocumentFragment.call(doc);
    // creating shadow internal record
    const record = {
        mode,
        delegatesFocus: !!delegatesFocus,
        host: elm,
        shadowRoot: sr,
    };
    InternalSlot.set(sr, record);
    InternalSlot.set(elm, record);
    const shadowResolver = () => sr;
    const x = (shadowResolver.nodeKey = uid++);
    setNodeKey(elm, x);
    setShadowRootResolver(sr, shadowResolver);
    // correcting the proto chain
    setPrototypeOf(sr, SyntheticShadowRoot.prototype);
    return sr;
}
const SyntheticShadowRootDescriptors = {
    constructor: {
        writable: true,
        configurable: true,
        value: SyntheticShadowRoot,
    },
    toString: {
        writable: true,
        configurable: true,
        value() {
            return `[object ShadowRoot]`;
        },
    },
    synthetic: {
        writable: false,
        enumerable: false,
        configurable: false,
        value: true,
    },
};
const ShadowRootDescriptors = {
    activeElement: {
        enumerable: true,
        configurable: true,
        get() {
            const host = getHost(this);
            const doc = getOwnerDocument(host);
            const activeElement = DocumentPrototypeActiveElement.call(doc);
            if (isNull(activeElement)) {
                return activeElement;
            }
            if ((compareDocumentPosition.call(host, activeElement) &
                DOCUMENT_POSITION_CONTAINED_BY) ===
                0) {
                return null;
            }
            // activeElement must be child of the host and owned by it
            let node = activeElement;
            while (!isNodeOwnedBy(host, node)) {
                // parentElement is always an element because we are talking up the tree knowing
                // that it is a child of the host.
                node = parentElementGetter.call(node);
            }
            // If we have a slot element here that means that we were dealing
            // with an element that was passed to one of our slots. In this
            // case, activeElement returns null.
            if (isSlotElement(node)) {
                return null;
            }
            return node;
        },
    },
    delegatesFocus: {
        configurable: true,
        get() {
            return getInternalSlot(this).delegatesFocus;
        },
    },
    elementFromPoint: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(left, top) {
            const host = getHost(this);
            const doc = getOwnerDocument(host);
            return fauxElementFromPoint(this, doc, left, top);
        },
    },
    elementsFromPoint: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(left, top) {
            const host = getHost(this);
            const doc = getOwnerDocument(host);
            return fauxElementsFromPoint(this, doc, left, top);
        },
    },
    getSelection: {
        writable: true,
        enumerable: true,
        configurable: true,
        value() {
            throw new Error('Disallowed method "getSelection" on ShadowRoot.');
        },
    },
    host: {
        enumerable: true,
        configurable: true,
        get() {
            return getHost(this);
        },
    },
    mode: {
        configurable: true,
        get() {
            return getInternalSlot(this).mode;
        },
    },
    styleSheets: {
        enumerable: true,
        configurable: true,
        get() {
            throw new Error();
        },
    },
};
const eventToShadowRootMap = new WeakMap();
const NodePatchDescriptors = {
    insertBefore: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(newChild, refChild) {
            insertBefore.call(getHost(this), newChild, refChild);
            return newChild;
        },
    },
    removeChild: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(oldChild) {
            removeChild.call(getHost(this), oldChild);
            return oldChild;
        },
    },
    appendChild: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(newChild) {
            appendChild.call(getHost(this), newChild);
            return newChild;
        },
    },
    replaceChild: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(newChild, oldChild) {
            replaceChild.call(getHost(this), newChild, oldChild);
            return oldChild;
        },
    },
    addEventListener: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(type, listener, options) {
            addShadowRootEventListener(this, type, listener);
        },
    },
    dispatchEvent: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(evt) {
            eventToShadowRootMap.set(evt, this);
            // Typescript does not like it when you treat the `arguments` object as an array
            // @ts-expect-error type-mismatch
            return dispatchEvent.apply(getHost(this), arguments);
        },
    },
    removeEventListener: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(type, listener, options) {
            removeShadowRootEventListener(this, type, listener);
        },
    },
    baseURI: {
        enumerable: true,
        configurable: true,
        get() {
            return getHost(this).baseURI;
        },
    },
    childNodes: {
        enumerable: true,
        configurable: true,
        get() {
            return createStaticNodeList(shadowRootChildNodes(this));
        },
    },
    cloneNode: {
        writable: true,
        enumerable: true,
        configurable: true,
        value() {
            throw new Error('Disallowed method "cloneNode" on ShadowRoot.');
        },
    },
    compareDocumentPosition: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(otherNode) {
            const host = getHost(this);
            if (this === otherNode) {
                // "this" and "otherNode" are the same shadow root.
                return 0;
            }
            else if (this.contains(otherNode)) {
                // "otherNode" belongs to the shadow tree where "this" is the shadow root.
                return 20; // Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING
            }
            else if (compareDocumentPosition.call(host, otherNode) & DOCUMENT_POSITION_CONTAINED_BY) {
                // "otherNode" is in a different shadow tree contained by the shadow tree where "this" is the shadow root.
                return 37; // Node.DOCUMENT_POSITION_DISCONNECTED | Node.DOCUMENT_POSITION_FOLLOWING | Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
            }
            else {
                // "otherNode" is in a different shadow tree that is not contained by the shadow tree where "this" is the shadow root.
                return 35; // Node.DOCUMENT_POSITION_DISCONNECTED | Node.DOCUMENT_POSITION_PRECEDING | Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
            }
        },
    },
    contains: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(otherNode) {
            if (this === otherNode) {
                return true;
            }
            const host = getHost(this);
            // must be child of the host and owned by it.
            return ((compareDocumentPosition.call(host, otherNode) & DOCUMENT_POSITION_CONTAINED_BY) !==
                0 && isNodeOwnedBy(host, otherNode));
        },
    },
    firstChild: {
        enumerable: true,
        configurable: true,
        get() {
            const childNodes = getInternalChildNodes(this);
            return childNodes[0] || null;
        },
    },
    lastChild: {
        enumerable: true,
        configurable: true,
        get() {
            const childNodes = getInternalChildNodes(this);
            return childNodes[childNodes.length - 1] || null;
        },
    },
    hasChildNodes: {
        writable: true,
        enumerable: true,
        configurable: true,
        value() {
            const childNodes = getInternalChildNodes(this);
            return childNodes.length > 0;
        },
    },
    isConnected: {
        enumerable: true,
        configurable: true,
        get() {
            return isConnected.call(getHost(this));
        },
    },
    nextSibling: {
        enumerable: true,
        configurable: true,
        get() {
            return null;
        },
    },
    previousSibling: {
        enumerable: true,
        configurable: true,
        get() {
            return null;
        },
    },
    nodeName: {
        enumerable: true,
        configurable: true,
        get() {
            return '#document-fragment';
        },
    },
    nodeType: {
        enumerable: true,
        configurable: true,
        get() {
            return 11; // Node.DOCUMENT_FRAGMENT_NODE
        },
    },
    nodeValue: {
        enumerable: true,
        configurable: true,
        get() {
            return null;
        },
    },
    ownerDocument: {
        enumerable: true,
        configurable: true,
        get() {
            return getHost(this).ownerDocument;
        },
    },
    parentElement: {
        enumerable: true,
        configurable: true,
        get() {
            return null;
        },
    },
    parentNode: {
        enumerable: true,
        configurable: true,
        get() {
            return null;
        },
    },
    textContent: {
        enumerable: true,
        configurable: true,
        get() {
            const childNodes = getInternalChildNodes(this);
            let textContent = '';
            for (let i = 0, len = childNodes.length; i < len; i += 1) {
                const currentNode = childNodes[i];
                if (currentNode.nodeType !== COMMENT_NODE) {
                    textContent += getTextContent(currentNode);
                }
            }
            return textContent;
        },
        set(v) {
            const host = getHost(this);
            textContextSetter.call(host, v);
        },
    },
    // Since the synthetic shadow root is a detached DocumentFragment, short-circuit the getRootNode behavior
    getRootNode: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(options) {
            return !isUndefined(options) && isTrue(options.composed)
                ? getHost(this).getRootNode(options)
                : this;
        },
    },
};
const ElementPatchDescriptors = {
    innerHTML: {
        enumerable: true,
        configurable: true,
        get() {
            const childNodes = getInternalChildNodes(this);
            let innerHTML = '';
            for (let i = 0, len = childNodes.length; i < len; i += 1) {
                innerHTML += getOuterHTML(childNodes[i]);
            }
            return innerHTML;
        },
        set(v) {
            const host = getHost(this);
            innerHTMLSetter.call(host, v);
        },
    },
};
const ParentNodePatchDescriptors = {
    childElementCount: {
        enumerable: true,
        configurable: true,
        get() {
            return this.children.length;
        },
    },
    children: {
        enumerable: true,
        configurable: true,
        get() {
            return createStaticHTMLCollection(ArrayFilter.call(shadowRootChildNodes(this), (elm) => elm instanceof Element));
        },
    },
    firstElementChild: {
        enumerable: true,
        configurable: true,
        get() {
            return this.children[0] || null;
        },
    },
    lastElementChild: {
        enumerable: true,
        configurable: true,
        get() {
            const { children } = this;
            return children.item(children.length - 1) || null;
        },
    },
    getElementById: {
        writable: true,
        enumerable: true,
        configurable: true,
        value() {
            throw new Error('Disallowed method "getElementById" on ShadowRoot.');
        },
    },
    querySelector: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(selectors) {
            return shadowRootQuerySelector(this, selectors);
        },
    },
    querySelectorAll: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(selectors) {
            return createStaticNodeList(shadowRootQuerySelectorAll(this, selectors));
        },
    },
};
assign(SyntheticShadowRootDescriptors, NodePatchDescriptors, ParentNodePatchDescriptors, ElementPatchDescriptors, ShadowRootDescriptors);
function SyntheticShadowRoot() {
    throw new TypeError('Illegal constructor');
}
SyntheticShadowRoot.prototype = create(DocumentFragment.prototype, SyntheticShadowRootDescriptors);
// `this.shadowRoot instanceof ShadowRoot` should evaluate to true even for synthetic shadow
defineProperty(SyntheticShadowRoot, Symbol.hasInstance, {
    value: function (object) {
        // Technically we should walk up the entire prototype chain, but with SyntheticShadowRoot
        // it's reasonable to assume that no one is doing any deep subclasses here.
        return (isObject(object) &&
            !isNull(object) &&
            (isInstanceOfNativeShadowRoot(object) ||
                getPrototypeOf(object) === SyntheticShadowRoot.prototype));
    },
});

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
function isSyntheticOrNativeShadowRoot(node) {
    return isSyntheticShadowRoot(node) || isInstanceOfNativeShadowRoot(node);
}
// Helpful for tests running with jsdom
function getOwnerDocument(node) {
    const doc = ownerDocumentGetter.call(node);
    // if doc is null, it means `this` is actually a document instance
    return doc === null ? node : doc;
}
function getOwnerWindow(node) {
    const doc = getOwnerDocument(node);
    const win = defaultViewGetter.call(doc);
    if (win === null) {
        // this method should never be called with a node that is not part
        // of a qualifying connected node.
        throw new TypeError();
    }
    return win;
}
let skipGlobalPatching;
// Note: we deviate from native shadow here, but are not fixing
// due to backwards compat: https://github.com/salesforce/lwc/pull/3103
function isGlobalPatchingSkipped(node) {
    // we lazily compute this value instead of doing it during evaluation, this helps
    // for apps that are setting this after the engine code is evaluated.
    if (isUndefined(skipGlobalPatching)) {
        const ownerDocument = getOwnerDocument(node);
        skipGlobalPatching =
            ownerDocument.body &&
                getAttribute.call(ownerDocument.body, 'data-global-patching-bypass') ===
                    'temporary-bypass';
    }
    return isTrue(skipGlobalPatching);
}
function arrayFromCollection(collection) {
    const size = collection.length;
    const cloned = [];
    if (size > 0) {
        for (let i = 0; i < size; i++) {
            cloned[i] = collection[i];
        }
    }
    return cloned;
}

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
function pathComposer(startNode, composed) {
    const composedPath = [];
    let startRoot;
    if (startNode instanceof Window) {
        startRoot = startNode;
    }
    else if (startNode instanceof _Node) {
        startRoot = startNode.getRootNode();
    }
    else {
        return composedPath;
    }
    let current = startNode;
    while (!isNull(current)) {
        composedPath.push(current);
        if (current instanceof Element || current instanceof Text) {
            const assignedSlot = current.assignedSlot;
            if (!isNull(assignedSlot)) {
                current = assignedSlot;
            }
            else {
                current = current.parentNode;
            }
        }
        else if (isSyntheticOrNativeShadowRoot(current) && (composed || current !== startRoot)) {
            current = current.host;
        }
        else if (current instanceof _Node) {
            current = current.parentNode;
        }
        else {
            // could be Window
            current = null;
        }
    }
    let doc;
    if (startNode instanceof Window) {
        doc = startNode.document;
    }
    else {
        doc = getOwnerDocument(startNode);
    }
    // event composedPath includes window when startNode's ownerRoot is document
    if (composedPath[composedPath.length - 1] === doc) {
        composedPath.push(window);
    }
    return composedPath;
}

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
function retarget(refNode, path) {
    if (isNull(refNode)) {
        return null;
    }
    // If ANCESTOR's root is not a shadow root or ANCESTOR's root is BASE's
    // shadow-including inclusive ancestor, return ANCESTOR.
    const refNodePath = pathComposer(refNode, true);
    const p$ = path;
    for (let i = 0, ancestor, lastRoot, root, rootIdx; i < p$.length; i++) {
        ancestor = p$[i];
        root = ancestor instanceof Window ? ancestor : ancestor.getRootNode();
        // Retarget to ancestor if ancestor is not shadowed
        if (!isSyntheticOrNativeShadowRoot(root)) {
            return ancestor;
        }
        if (root !== lastRoot) {
            rootIdx = refNodePath.indexOf(root);
            lastRoot = root;
        }
        // Retarget to ancestor if ancestor is shadowed by refNode's shadow root
        if (!isUndefined(rootIdx) && rootIdx > -1) {
            return ancestor;
        }
    }
    return null;
}

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
function fauxElementFromPoint(context, doc, left, top) {
    const element = elementFromPoint.call(doc, left, top);
    if (isNull(element)) {
        return element;
    }
    return retarget(context, pathComposer(element, true));
}

/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
function elemFromPoint(left, top) {
    return fauxElementFromPoint(this, this, left, top);
}
Document.prototype.elementFromPoint = elemFromPoint;
function elemsFromPoint(left, top) {
    return fauxElementsFromPoint(this, this, left, top);
}
Document.prototype.elementsFromPoint = elemsFromPoint;
// Go until we reach to top of the LWC tree
defineProperty(Document.prototype, 'activeElement', {
    get() {
        let node = DocumentPrototypeActiveElement.call(this);
        if (isNull(node)) {
            return node;
        }
        while (!isUndefined(getNodeOwnerKey(node))) {
            node = parentElementGetter.call(node);
            if (isNull(node)) {
                return null;
            }
        }
        if (node.tagName === 'HTML') {
            // IE 11. Active element should never be html element
            node = this.body;
        }
        return node;
    },
    enumerable: true,
    configurable: true,
});
// The following patched methods hide shadowed elements from global
// traversing mechanisms. They are simplified for performance reasons to
// filter by ownership and do not account for slotted elements. This
// compromise is fine for our synthetic shadow dom because root elements
// cannot have slotted elements.
// Another compromise here is that all these traversing methods will return
// static HTMLCollection or static NodeList. We decided that this compromise
// is not a big problem considering the amount of code that is relying on
// the liveliness of these results are rare.
defineProperty(Document.prototype, 'getElementById', {
    value() {
        const elm = getElementById.apply(this, ArraySlice.call(arguments));
        if (isNull(elm)) {
            return null;
        }
        // Note: we deviate from native shadow here, but are not fixing
        // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
        return isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(elm) ? elm : null;
    },
    writable: true,
    enumerable: true,
    configurable: true,
});
defineProperty(Document.prototype, 'querySelector', {
    value() {
        const elements = arrayFromCollection(querySelectorAll.apply(this, ArraySlice.call(arguments)));
        const filtered = ArrayFind.call(elements, 
        // Note: we deviate from native shadow here, but are not fixing
        // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
        (elm) => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(elm));
        return !isUndefined(filtered) ? filtered : null;
    },
    writable: true,
    enumerable: true,
    configurable: true,
});
defineProperty(Document.prototype, 'querySelectorAll', {
    value() {
        const elements = arrayFromCollection(querySelectorAll.apply(this, ArraySlice.call(arguments)));
        const filtered = ArrayFilter.call(elements, 
        // Note: we deviate from native shadow here, but are not fixing
        // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
        (elm) => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(elm));
        return createStaticNodeList(filtered);
    },
    writable: true,
    enumerable: true,
    configurable: true,
});
defineProperty(Document.prototype, 'getElementsByClassName', {
    value() {
        const elements = arrayFromCollection(getElementsByClassName.apply(this, ArraySlice.call(arguments)));
        const filtered = ArrayFilter.call(elements, 
        // Note: we deviate from native shadow here, but are not fixing
        // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
        (elm) => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(elm));
        return createStaticHTMLCollection(filtered);
    },
    writable: true,
    enumerable: true,
    configurable: true,
});
defineProperty(Document.prototype, 'getElementsByTagName', {
    value() {
        const elements = arrayFromCollection(getElementsByTagName.apply(this, ArraySlice.call(arguments)));
        const filtered = ArrayFilter.call(elements, 
        // Note: we deviate from native shadow here, but are not fixing
        // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
        (elm) => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(elm));
        return createStaticHTMLCollection(filtered);
    },
    writable: true,
    enumerable: true,
    configurable: true,
});
defineProperty(Document.prototype, 'getElementsByTagNameNS', {
    value() {
        const elements = arrayFromCollection(getElementsByTagNameNS.apply(this, ArraySlice.call(arguments)));
        const filtered = ArrayFilter.call(elements, 
        // Note: we deviate from native shadow here, but are not fixing
        // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
        (elm) => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(elm));
        return createStaticHTMLCollection(filtered);
    },
    writable: true,
    enumerable: true,
    configurable: true,
});
defineProperty(
// In Firefox v57 and lower, getElementsByName is defined on HTMLDocument.prototype
getOwnPropertyDescriptor(HTMLDocument.prototype, 'getElementsByName')
    ? HTMLDocument.prototype
    : Document.prototype, 'getElementsByName', {
    value() {
        const elements = arrayFromCollection(getElementsByName.apply(this, ArraySlice.call(arguments)));
        const filtered = ArrayFilter.call(elements, 
        // Note: we deviate from native shadow here, but are not fixing
        // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
        (elm) => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(elm));
        return createStaticNodeList(filtered);
    },
    writable: true,
    enumerable: true,
    configurable: true,
});

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
Object.defineProperty(window, 'ShadowRoot', {
    value: SyntheticShadowRoot,
    configurable: true,
    writable: true,
});

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const CustomEventConstructor = CustomEvent;
function PatchedCustomEvent(type, eventInitDict) {
    const event = new CustomEventConstructor(type, eventInitDict);
    const isComposed = !!(eventInitDict && eventInitDict.composed);
    Object.defineProperties(event, {
        composed: {
            get() {
                return isComposed;
            },
            configurable: true,
            enumerable: true,
        },
    });
    return event;
}
PatchedCustomEvent.prototype = CustomEventConstructor.prototype;
window.CustomEvent = PatchedCustomEvent;

/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// Note that ClipboardEvent is undefined in Jest/jsdom
// See: https://github.com/jsdom/jsdom/issues/1568
if (typeof ClipboardEvent !== 'undefined') {
    const isComposedType = assign(create(null), {
        copy: 1,
        cut: 1,
        paste: 1,
    });
    // Patch the prototype to override the composed property on user-agent dispatched events
    defineProperties(ClipboardEvent.prototype, {
        composed: {
            get() {
                const { type } = this;
                return isComposedType[type] === 1;
            },
            configurable: true,
            enumerable: true,
        },
    });
}

/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const OriginalMutationObserver = MutationObserver;
const { disconnect: originalDisconnect, observe: originalObserve, takeRecords: originalTakeRecords, } = OriginalMutationObserver.prototype;
// Internal fields to maintain relationships
const wrapperLookupField = '$$lwcObserverCallbackWrapper$$';
const observerLookupField = '$$lwcNodeObservers$$';
const observerToNodesMap = new WeakMap();
function getNodeObservers(node) {
    return node[observerLookupField];
}
function setNodeObservers(node, observers) {
    node[observerLookupField] = observers;
}
/**
 * Retarget the mutation record's target value to its shadowRoot
 * @param originalRecord
 */
function retargetMutationRecord(originalRecord) {
    const { addedNodes, removedNodes, target, type } = originalRecord;
    const retargetedRecord = create(MutationRecord.prototype);
    defineProperties(retargetedRecord, {
        addedNodes: {
            get() {
                return addedNodes;
            },
            enumerable: true,
            configurable: true,
        },
        removedNodes: {
            get() {
                return removedNodes;
            },
            enumerable: true,
            configurable: true,
        },
        type: {
            get() {
                return type;
            },
            enumerable: true,
            configurable: true,
        },
        target: {
            get() {
                return target.shadowRoot;
            },
            enumerable: true,
            configurable: true,
        },
    });
    return retargetedRecord;
}
/**
 * Utility to identify if a target node is being observed by the given observer
 * Start at the current node, if the observer is registered to observe the current node, the mutation qualifies
 * @param observer
 * @param target
 */
function isQualifiedObserver(observer, target) {
    let parentNode = target;
    while (!isNull(parentNode)) {
        const parentNodeObservers = getNodeObservers(parentNode);
        if (!isUndefined(parentNodeObservers) &&
            (parentNodeObservers[0] === observer || // perf optimization to check for the first item is a match
                ArrayIndexOf.call(parentNodeObservers, observer) !== -1)) {
            return true;
        }
        parentNode = parentNode.parentNode;
    }
    return false;
}
/**
 * This function provides a shadow dom compliant filtered view of mutation records for a given observer.
 *
 * The key logic here is to determine if a given observer has been registered to observe any nodes
 * between the target node of a mutation record to the target's root node.
 * This function also retargets records when mutations occur directly under the shadow root
 * @param mutations
 * @param observer
 */
function filterMutationRecords(mutations, observer) {
    const result = [];
    for (const record of mutations) {
        const { target, type } = record;
        // If target is an lwc host,
        // Determine if the mutations affected the host or the shadowRoot
        // Mutations affecting host: changes to slot content
        // Mutations affecting shadowRoot: changes to template content
        if (type === 'childList' && !isUndefined(getNodeKey(target))) {
            const { addedNodes } = record;
            // In case of added nodes, we can climb up the tree and determine eligibility
            if (addedNodes.length > 0) {
                // Optimization: Peek in and test one node to decide if the MutationRecord qualifies
                // The remaining nodes in this MutationRecord will have the same ownerKey
                const sampleNode = addedNodes[0];
                if (isQualifiedObserver(observer, sampleNode)) {
                    // If the target was being observed, then return record as-is
                    // this will be the case for slot content
                    const nodeObservers = getNodeObservers(target);
                    if (nodeObservers &&
                        (nodeObservers[0] === observer ||
                            ArrayIndexOf.call(nodeObservers, observer) !== -1)) {
                        ArrayPush.call(result, record);
                    }
                    else {
                        // else, must be observing the shadowRoot
                        ArrayPush.call(result, retargetMutationRecord(record));
                    }
                }
            }
            else {
                const { removedNodes } = record;
                // In the case of removed nodes, climbing the tree is not an option as the nodes are disconnected
                // We can only check if either the host or shadow root was observed and qualify the record
                const shadowRoot = target.shadowRoot;
                const sampleNode = removedNodes[0];
                if (getNodeNearestOwnerKey(target) === getNodeNearestOwnerKey(sampleNode) && // trickery: sampleNode is slot content
                    isQualifiedObserver(observer, target) // use target as a close enough reference to climb up
                ) {
                    ArrayPush.call(result, record);
                }
                else if (shadowRoot) {
                    const shadowRootObservers = getNodeObservers(shadowRoot);
                    if (shadowRootObservers &&
                        (shadowRootObservers[0] === observer ||
                            ArrayIndexOf.call(shadowRootObservers, observer) !== -1)) {
                        ArrayPush.call(result, retargetMutationRecord(record));
                    }
                }
            }
        }
        else {
            // Mutation happened under a root node(shadow root or document) and the decision is straighforward
            // Ascend the tree starting from target and check if observer is qualified
            if (isQualifiedObserver(observer, target)) {
                ArrayPush.call(result, record);
            }
        }
    }
    return result;
}
function getWrappedCallback(callback) {
    let wrappedCallback = callback[wrapperLookupField];
    if (isUndefined(wrappedCallback)) {
        wrappedCallback = callback[wrapperLookupField] = (mutations, observer) => {
            // Filter mutation records
            const filteredRecords = filterMutationRecords(mutations, observer);
            // If not records are eligible for the observer, do not invoke callback
            if (filteredRecords.length === 0) {
                return;
            }
            callback.call(observer, filteredRecords, observer);
        };
    }
    return wrappedCallback;
}
/**
 * Patched MutationObserver constructor.
 * 1. Wrap the callback to filter out MutationRecords based on dom ownership
 * 2. Add a property field to track all observed targets of the observer instance
 * @param callback
 */
function PatchedMutationObserver(callback) {
    const wrappedCallback = getWrappedCallback(callback);
    const observer = new OriginalMutationObserver(wrappedCallback);
    return observer;
}
function patchedDisconnect() {
    originalDisconnect.call(this);
    // Clear the node to observer reference which is a strong references
    const observedNodes = observerToNodesMap.get(this);
    if (!isUndefined(observedNodes)) {
        forEach.call(observedNodes, (observedNode) => {
            const observers = observedNode[observerLookupField];
            if (!isUndefined(observers)) {
                const index = ArrayIndexOf.call(observers, this);
                if (index !== -1) {
                    ArraySplice.call(observers, index, 1);
                }
            }
        });
        observedNodes.length = 0;
    }
}
/**
 * A single mutation observer can observe multiple nodes(target).
 * Maintain a list of all targets that the observer chooses to observe
 * @param target
 * @param options
 */
function patchedObserve(target, options) {
    let targetObservers = getNodeObservers(target);
    // Maintain a list of all observers that want to observe a node
    if (isUndefined(targetObservers)) {
        targetObservers = [];
        setNodeObservers(target, targetObservers);
    }
    // Same observer trying to observe the same node
    if (ArrayIndexOf.call(targetObservers, this) === -1) {
        ArrayPush.call(targetObservers, this);
    } // else There is more bookkeeping to do here https://dom.spec.whatwg.org/#dom-mutationobserver-observe Step #7
    // SyntheticShadowRoot instances are not actually a part of the DOM so observe the host instead.
    if (isSyntheticShadowRoot(target)) {
        target = target.host;
    }
    // maintain a list of all nodes observed by this observer
    if (observerToNodesMap.has(this)) {
        const observedNodes = observerToNodesMap.get(this);
        if (ArrayIndexOf.call(observedNodes, target) === -1) {
            ArrayPush.call(observedNodes, target);
        }
    }
    else {
        observerToNodesMap.set(this, [target]);
    }
    return originalObserve.call(this, target, options);
}
/**
 * Patch the takeRecords() api to filter MutationRecords based on the observed targets
 */
function patchedTakeRecords() {
    return filterMutationRecords(originalTakeRecords.call(this), this);
}
PatchedMutationObserver.prototype = OriginalMutationObserver.prototype;
PatchedMutationObserver.prototype.disconnect = patchedDisconnect;
PatchedMutationObserver.prototype.observe = patchedObserve;
PatchedMutationObserver.prototype.takeRecords = patchedTakeRecords;
defineProperty(window, 'MutationObserver', {
    value: PatchedMutationObserver,
    configurable: true,
    writable: true,
});

/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
function patchedAddEventListener(type, listener, optionsOrCapture) {
    if (isSyntheticShadowHost(this)) {
        // Typescript does not like it when you treat the `arguments` object as an array
        // @ts-expect-error type-mismatch
        return addCustomElementEventListener.apply(this, arguments);
    }
    if (this instanceof _Node && isInstanceOfNativeShadowRoot(this.getRootNode())) {
        // Typescript does not like it when you treat the `arguments` object as an array
        // @ts-expect-error type-mismatch
        return addEventListener.apply(this, arguments);
    }
    if (arguments.length < 2) {
        // Slow path, unlikely to be called frequently. We expect modern browsers to throw:
        // https://googlechrome.github.io/samples/event-listeners-mandatory-arguments/
        const args = ArraySlice.call(arguments);
        if (args.length > 1) {
            args[1] = getEventListenerWrapper(args[1]);
        }
        // Ignore types because we're passing through to native method
        // @ts-expect-error type-mismatch
        return addEventListener.apply(this, args);
    }
    // Fast path. This function is optimized to avoid ArraySlice because addEventListener is called
    // very frequently, and it provides a measurable perf boost to avoid so much array cloning.
    const wrappedListener = getEventListenerWrapper(listener);
    // The third argument is optional, so passing in `undefined` for `optionsOrCapture` gives capture=false
    return addEventListener.call(this, type, wrappedListener, optionsOrCapture);
}
function patchedRemoveEventListener(_type, _listener, _optionsOrCapture) {
    if (isSyntheticShadowHost(this)) {
        // Typescript does not like it when you treat the `arguments` object as an array
        // @ts-expect-error type-mismatch
        return removeCustomElementEventListener.apply(this, arguments);
    }
    const args = ArraySlice.call(arguments);
    if (arguments.length > 1) {
        args[1] = getEventListenerWrapper(args[1]);
    }
    // Ignore types because we're passing through to native method
    // @ts-expect-error type-mismatch
    removeEventListener.apply(this, args);
    // Account for listeners that were added before this polyfill was applied
    // Typescript does not like it when you treat the `arguments` object as an array
    // @ts-expect-error type-mismatch
    removeEventListener.apply(this, arguments);
}
defineProperties(eventTargetPrototype, {
    addEventListener: {
        value: patchedAddEventListener,
        enumerable: true,
        writable: true,
        configurable: true,
    },
    removeEventListener: {
        value: patchedRemoveEventListener,
        enumerable: true,
        writable: true,
        configurable: true,
    },
});

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
function patchedCurrentTargetGetter() {
    const currentTarget = eventCurrentTargetGetter.call(this);
    if (isNull(currentTarget)) {
        return null;
    }
    if (eventToContextMap.get(this) === 1 /* EventListenerContext.SHADOW_ROOT_LISTENER */) {
        return getShadowRoot(currentTarget);
    }
    return currentTarget;
}
function patchedTargetGetter() {
    const originalTarget = eventTargetGetter.call(this);
    if (!(originalTarget instanceof _Node)) {
        return originalTarget;
    }
    const doc = getOwnerDocument(originalTarget);
    const composedPath = pathComposer(originalTarget, this.composed);
    const originalCurrentTarget = eventCurrentTargetGetter.call(this);
    // Handle cases where the currentTarget is null (for async events), and when an event has been
    // added to Window
    if (!(originalCurrentTarget instanceof _Node)) {
        // TODO [#1511]: Special escape hatch to support legacy behavior. Should be fixed.
        // If the event's target is being accessed async and originalTarget is not a keyed element, do not retarget
        if (isNull(originalCurrentTarget) && isUndefined(getNodeOwnerKey(originalTarget))) {
            return originalTarget;
        }
        return retarget(doc, composedPath);
    }
    else if (originalCurrentTarget === doc || originalCurrentTarget === doc.body) {
        // TODO [#1530]: If currentTarget is document or document.body (Third party libraries that have global event listeners)
        // and the originalTarget is not a keyed element, do not retarget
        if (isUndefined(getNodeOwnerKey(originalTarget))) {
            return originalTarget;
        }
        return retarget(doc, composedPath);
    }
    let actualCurrentTarget = originalCurrentTarget;
    let actualPath = composedPath;
    // Address the possibility that `currentTarget` is a shadow root
    if (isSyntheticShadowHost(originalCurrentTarget)) {
        const context = eventToContextMap.get(this);
        if (context === 1 /* EventListenerContext.SHADOW_ROOT_LISTENER */) {
            actualCurrentTarget = getShadowRoot(originalCurrentTarget);
        }
    }
    // Address the possibility that `target` is a shadow root
    if (isSyntheticShadowHost(originalTarget) && eventToShadowRootMap.has(this)) {
        actualPath = pathComposer(getShadowRoot(originalTarget), this.composed);
    }
    return retarget(actualCurrentTarget, actualPath);
}
function patchedComposedPathValue() {
    const originalTarget = eventTargetGetter.call(this);
    // Account for events with targets that are not instances of Node (e.g., when a readystatechange
    // handler is listening on an instance of XMLHttpRequest).
    if (!(originalTarget instanceof _Node)) {
        return [];
    }
    // If the original target is inside a native shadow root, then just call the native
    // composePath() method. The event is already retargeted and this causes our composedPath()
    // polyfill to compute the wrong value. This is only an issue when you have a native web
    // component inside an LWC component (see test in same commit) but this scenario is unlikely
    // because we don't yet support that. Workaround specifically for W-9846457. Mixed mode solution
    // will likely be more involved.
    const hasShadowRoot = Boolean(originalTarget.shadowRoot);
    const hasSyntheticShadowRootAttached = hasInternalSlot(originalTarget);
    if (hasShadowRoot && !hasSyntheticShadowRootAttached) {
        return composedPath.call(this);
    }
    const originalCurrentTarget = eventCurrentTargetGetter.call(this);
    // If the event has completed propagation, the composedPath should be an empty array.
    if (isNull(originalCurrentTarget)) {
        return [];
    }
    // Address the possibility that `target` is a shadow root
    let actualTarget = originalTarget;
    if (isSyntheticShadowHost(originalTarget) && eventToShadowRootMap.has(this)) {
        actualTarget = getShadowRoot(originalTarget);
    }
    return pathComposer(actualTarget, this.composed);
}
defineProperties(Event.prototype, {
    target: {
        get: patchedTargetGetter,
        enumerable: true,
        configurable: true,
    },
    currentTarget: {
        get: patchedCurrentTargetGetter,
        enumerable: true,
        configurable: true,
    },
    composedPath: {
        value: patchedComposedPathValue,
        writable: true,
        enumerable: true,
        configurable: true,
    },
    // Non-standard but widely supported for backwards-compatibility
    srcElement: {
        get: patchedTargetGetter,
        enumerable: true,
        configurable: true,
    },
    // Non-standard but implemented in Chrome and continues to exist for backwards-compatibility
    // https://source.chromium.org/chromium/chromium/src/+/master:third_party/blink/renderer/core/dom/events/event.idl;l=58?q=event.idl&ss=chromium
    path: {
        get: patchedComposedPathValue,
        enumerable: true,
        configurable: true,
    },
});

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
function retargetRelatedTarget(Ctor) {
    const relatedTargetGetter = getOwnPropertyDescriptor(Ctor.prototype, 'relatedTarget')
        .get;
    defineProperty(Ctor.prototype, 'relatedTarget', {
        get() {
            const relatedTarget = relatedTargetGetter.call(this);
            if (isNull(relatedTarget)) {
                return null;
            }
            if (!(relatedTarget instanceof _Node) || !isNodeShadowed(relatedTarget)) {
                return relatedTarget;
            }
            let pointOfReference = eventCurrentTargetGetter.call(this);
            if (isNull(pointOfReference)) {
                pointOfReference = getOwnerDocument(relatedTarget);
            }
            return retarget(pointOfReference, pathComposer(relatedTarget, true));
        },
        enumerable: true,
        configurable: true,
    });
}

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
retargetRelatedTarget(FocusEvent);

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
retargetRelatedTarget(MouseEvent);

/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assignedSlotGetter = hasOwnProperty.call(Text.prototype, 'assignedSlot')
    ? getOwnPropertyDescriptor(Text.prototype, 'assignedSlot').get
    : () => null;

/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// We can use a single observer without having to worry about leaking because
// "Registered observers in a node’s registered observer list have a weak
// reference to the node."
// https://dom.spec.whatwg.org/#garbage-collection
let observer;
const observerConfig = { childList: true };
const SlotChangeKey = new WeakMap();
function initSlotObserver() {
    return new MO((mutations) => {
        const slots = [];
        forEach.call(mutations, (mutation) => {
            if (process.env.NODE_ENV !== 'production') {
                assert.invariant(mutation.type === 'childList', `Invalid mutation type: ${mutation.type}. This mutation handler for slots should only handle "childList" mutations.`);
            }
            const { target: slot } = mutation;
            if (ArrayIndexOf.call(slots, slot) === -1) {
                ArrayPush.call(slots, slot);
                dispatchEvent.call(slot, new CustomEvent('slotchange'));
            }
        });
    });
}
function getFilteredSlotFlattenNodes(slot) {
    const childNodes = arrayFromCollection(childNodesGetter.call(slot));
    return ArrayReduce.call(childNodes, 
    // @ts-expect-error Array#reduce has a generic that is lost by our redefined ArrayReduce
    (seed, child) => {
        if (child instanceof Element && isSlotElement(child)) {
            ArrayPush.apply(seed, getFilteredSlotFlattenNodes(child));
        }
        else {
            ArrayPush.call(seed, child);
        }
        return seed;
    }, []);
}
function assignedSlotGetterPatched() {
    const parentNode = parentNodeGetter.call(this);
    // use original assignedSlot if parent has a native shdow root
    if (parentNode instanceof Element) {
        const sr = shadowRootGetter.call(parentNode);
        if (isInstanceOfNativeShadowRoot(sr)) {
            if (this instanceof Text) {
                return assignedSlotGetter.call(this);
            }
            return assignedSlotGetter$1.call(this);
        }
    }
    /**
     * The node is assigned to a slot if:
     * - it has a parent and its parent is a slot element
     * - and if the slot owner key is different than the node owner key.
     * When the slot and the slotted node are 2 different shadow trees, the owner keys will be
     * different. When the slot is in a shadow tree and the slotted content is a light DOM node,
     * the light DOM node doesn't have an owner key and therefor the slot owner key will be
     * different than the node owner key (always `undefined`).
     */
    if (!isNull(parentNode) &&
        isSlotElement(parentNode) &&
        getNodeOwnerKey(parentNode) !== getNodeOwnerKey(this)) {
        return parentNode;
    }
    return null;
}
defineProperties(HTMLSlotElement.prototype, {
    addEventListener: {
        value(type, listener, options) {
            // super.addEventListener - but that doesn't work with typescript
            HTMLElement.prototype.addEventListener.call(this, type, listener, options);
            if (type === 'slotchange' && !SlotChangeKey.get(this)) {
                SlotChangeKey.set(this, true);
                if (!observer) {
                    observer = initSlotObserver();
                }
                MutationObserverObserve.call(observer, this, observerConfig);
            }
        },
        writable: true,
        enumerable: true,
        configurable: true,
    },
    assignedElements: {
        value(options) {
            if (isNodeShadowed(this)) {
                const flatten = !isUndefined(options) && isTrue(options.flatten);
                const nodes = flatten
                    ? getFilteredSlotFlattenNodes(this)
                    : getFilteredSlotAssignedNodes(this);
                return ArrayFilter.call(nodes, (node) => node instanceof Element);
            }
            else {
                return assignedElements.apply(this, ArraySlice.call(arguments));
            }
        },
        writable: true,
        enumerable: true,
        configurable: true,
    },
    assignedNodes: {
        value(options) {
            if (isNodeShadowed(this)) {
                const flatten = !isUndefined(options) && isTrue(options.flatten);
                return flatten
                    ? getFilteredSlotFlattenNodes(this)
                    : getFilteredSlotAssignedNodes(this);
            }
            else {
                return assignedNodes.apply(this, ArraySlice.call(arguments));
            }
        },
        writable: true,
        enumerable: true,
        configurable: true,
    },
    name: {
        get() {
            const name = getAttribute.call(this, 'name');
            return isNull(name) ? '' : name;
        },
        set(value) {
            setAttribute.call(this, 'name', value);
        },
        enumerable: true,
        configurable: true,
    },
    childNodes: {
        get() {
            if (isNodeShadowed(this)) {
                const owner = getNodeOwner(this);
                const childNodes = isNull(owner)
                    ? []
                    : getAllMatches(owner, getFilteredChildNodes(this));
                return createStaticNodeList(childNodes);
            }
            return childNodesGetter.call(this);
        },
        enumerable: true,
        configurable: true,
    },
});

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// Non-deep-traversing patches: this descriptor map includes all descriptors that
// do not five access to nodes beyond the immediate children.
defineProperties(Text.prototype, {
    assignedSlot: {
        get: assignedSlotGetterPatched,
        enumerable: true,
        configurable: true,
    },
});

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
 * This methods filters out elements that are not in the same shadow root of context.
 * It does not enforce shadow dom semantics if $context is not managed by LWC
 * @param context
 * @param unfilteredNodes
 */
function getNonPatchedFilteredArrayOfNodes(context, unfilteredNodes) {
    let filtered;
    const ownerKey = getNodeOwnerKey(context);
    // a node inside a shadow.
    if (!isUndefined(ownerKey)) {
        if (isSyntheticShadowHost(context)) {
            // element with shadowRoot attached
            const owner = getNodeOwner(context);
            if (isNull(owner)) {
                filtered = [];
            }
            else if (getNodeKey(context)) {
                // it is a custom element, and we should then filter by slotted elements
                filtered = getAllSlottedMatches(context, unfilteredNodes);
            }
            else {
                // regular element, we should then filter by ownership
                filtered = getAllMatches(owner, unfilteredNodes);
            }
        }
        else {
            // context is handled by lwc, using getNodeNearestOwnerKey to include manually inserted elements in the same shadow.
            filtered = ArrayFilter.call(unfilteredNodes, (elm) => getNodeNearestOwnerKey(elm) === ownerKey);
        }
    }
    else if (context instanceof HTMLBodyElement) {
        // `context` is document.body which is already patched.
        filtered = ArrayFilter.call(unfilteredNodes, 
        // Note: we deviate from native shadow here, but are not fixing
        // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
        (elm) => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(context));
    }
    else {
        // `context` is outside the lwc boundary, return unfiltered list.
        filtered = ArraySlice.call(unfilteredNodes);
    }
    return filtered;
}

/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
function innerHTMLGetterPatched() {
    const childNodes = getInternalChildNodes(this);
    let innerHTML = '';
    for (let i = 0, len = childNodes.length; i < len; i += 1) {
        innerHTML += getOuterHTML(childNodes[i]);
    }
    return innerHTML;
}
function outerHTMLGetterPatched() {
    return getOuterHTML(this);
}
function attachShadowPatched(options) {
    // To retain native behavior of the API, provide synthetic shadowRoot only when specified
    if (options[KEY__SYNTHETIC_MODE]) {
        return attachShadow(this, options);
    }
    return attachShadow$1.call(this, options);
}
function shadowRootGetterPatched() {
    if (isSyntheticShadowHost(this)) {
        const shadow = getShadowRoot(this);
        if (shadow.mode === 'open') {
            return shadow;
        }
    }
    return shadowRootGetter.call(this);
}
function childrenGetterPatched() {
    const owner = getNodeOwner(this);
    const filteredChildNodes = getFilteredChildNodes(this);
    // No need to filter by owner for non-shadowed nodes
    const childNodes = isNull(owner)
        ? filteredChildNodes
        : getAllMatches(owner, filteredChildNodes);
    return createStaticHTMLCollection(ArrayFilter.call(childNodes, (node) => node instanceof Element));
}
function childElementCountGetterPatched() {
    return this.children.length;
}
function firstElementChildGetterPatched() {
    return this.children[0] || null;
}
function lastElementChildGetterPatched() {
    const { children } = this;
    return children.item(children.length - 1) || null;
}
// Non-deep-traversing patches: this descriptor map includes all descriptors that
// do not five access to nodes beyond the immediate children.
defineProperties(Element.prototype, {
    innerHTML: {
        get() {
            // Note: we deviate from native shadow here, but are not fixing
            // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
            if (isNodeShadowed(this) || isSyntheticShadowHost(this)) {
                return innerHTMLGetterPatched.call(this);
            }
            return innerHTMLGetter.call(this);
        },
        set(v) {
            innerHTMLSetter.call(this, v);
        },
        enumerable: true,
        configurable: true,
    },
    outerHTML: {
        get() {
            // Note: we deviate from native shadow here, but are not fixing
            // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
            if (isNodeShadowed(this) || isSyntheticShadowHost(this)) {
                return outerHTMLGetterPatched.call(this);
            }
            return outerHTMLGetter.call(this);
        },
        set(v) {
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
        get() {
            if (hasMountedChildren(this)) {
                return childrenGetterPatched.call(this);
            }
            return childrenGetter.call(this);
        },
        enumerable: true,
        configurable: true,
    },
    childElementCount: {
        get() {
            if (hasMountedChildren(this)) {
                return childElementCountGetterPatched.call(this);
            }
            return childElementCountGetter.call(this);
        },
        enumerable: true,
        configurable: true,
    },
    firstElementChild: {
        get() {
            if (hasMountedChildren(this)) {
                return firstElementChildGetterPatched.call(this);
            }
            return firstElementChildGetter.call(this);
        },
        enumerable: true,
        configurable: true,
    },
    lastElementChild: {
        get() {
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
    defineProperty(HTMLElement.prototype, 'innerHTML', getOwnPropertyDescriptor(Element.prototype, 'innerHTML'));
}
if (hasOwnProperty.call(HTMLElement.prototype, 'outerHTML')) {
    defineProperty(HTMLElement.prototype, 'outerHTML', getOwnPropertyDescriptor(Element.prototype, 'outerHTML'));
}
if (hasOwnProperty.call(HTMLElement.prototype, 'children')) {
    defineProperty(HTMLElement.prototype, 'children', getOwnPropertyDescriptor(Element.prototype, 'children'));
}
// Deep-traversing patches from this point on:
function querySelectorPatched() {
    const nodeList = arrayFromCollection(querySelectorAll$1.apply(this, ArraySlice.call(arguments)));
    if (isSyntheticShadowHost(this)) {
        // element with shadowRoot attached
        const owner = getNodeOwner(this);
        if (!isUndefined(getNodeKey(this))) {
            // it is a custom element, and we should then filter by slotted elements
            return getFirstSlottedMatch(this, nodeList);
        }
        else if (isNull(owner)) {
            return null;
        }
        else {
            // regular element, we should then filter by ownership
            return getFirstMatch(owner, nodeList);
        }
    }
    else if (isNodeShadowed(this)) {
        // element inside a shadowRoot
        const ownerKey = getNodeOwnerKey(this);
        if (!isUndefined(ownerKey)) {
            // `this` is handled by lwc, using getNodeNearestOwnerKey to include manually inserted elements in the same shadow.
            const elm = ArrayFind.call(nodeList, (elm) => getNodeNearestOwnerKey(elm) === ownerKey);
            return isUndefined(elm) ? null : elm;
        }
        else {
            // Note: we deviate from native shadow here, but are not fixing
            // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
            // `this` is a manually inserted element inside a shadowRoot, return the first element.
            return nodeList.length === 0 ? null : nodeList[0];
        }
    }
    else {
        if (!(this instanceof HTMLBodyElement)) {
            const elm = nodeList[0];
            return isUndefined(elm) ? null : elm;
        }
        // element belonging to the document
        const elm = ArrayFind.call(nodeList, (elm) => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(this));
        return isUndefined(elm) ? null : elm;
    }
}
function getFilteredArrayOfNodes(context, unfilteredNodes) {
    let filtered;
    if (isSyntheticShadowHost(context)) {
        // element with shadowRoot attached
        const owner = getNodeOwner(context);
        if (!isUndefined(getNodeKey(context))) {
            // it is a custom element, and we should then filter by slotted elements
            filtered = getAllSlottedMatches(context, unfilteredNodes);
        }
        else if (isNull(owner)) {
            filtered = [];
        }
        else {
            // regular element, we should then filter by ownership
            filtered = getAllMatches(owner, unfilteredNodes);
        }
    }
    else if (isNodeShadowed(context)) {
        // element inside a shadowRoot
        const ownerKey = getNodeOwnerKey(context);
        if (!isUndefined(ownerKey)) {
            // context is handled by lwc, using getNodeNearestOwnerKey to include manually inserted elements in the same shadow.
            filtered = ArrayFilter.call(unfilteredNodes, (elm) => getNodeNearestOwnerKey(elm) === ownerKey);
        }
        else {
            // Note: we deviate from native shadow here, but are not fixing
            // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
            // context is manually inserted without lwc:dom-manual, return everything
            filtered = ArraySlice.call(unfilteredNodes);
        }
    }
    else {
        if (context instanceof HTMLBodyElement) {
            // `context` is document.body or element belonging to the document with the patch enabled
            filtered = ArrayFilter.call(unfilteredNodes, (elm) => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(context));
        }
        else {
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
        value() {
            const nodeList = arrayFromCollection(querySelectorAll$1.apply(this, ArraySlice.call(arguments)));
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
            value() {
                const elements = arrayFromCollection(getElementsByClassName$1.apply(this, ArraySlice.call(arguments)));
                // Note: we deviate from native shadow here, but are not fixing
                // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
                return createStaticHTMLCollection(getNonPatchedFilteredArrayOfNodes(this, elements));
            },
            writable: true,
            enumerable: true,
            configurable: true,
        },
        getElementsByTagName: {
            value() {
                const elements = arrayFromCollection(getElementsByTagName$1.apply(this, ArraySlice.call(arguments)));
                // Note: we deviate from native shadow here, but are not fixing
                // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
                return createStaticHTMLCollection(getNonPatchedFilteredArrayOfNodes(this, elements));
            },
            writable: true,
            enumerable: true,
            configurable: true,
        },
        getElementsByTagNameNS: {
            value() {
                const elements = arrayFromCollection(getElementsByTagNameNS$1.apply(this, ArraySlice.call(arguments)));
                // Note: we deviate from native shadow here, but are not fixing
                // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
                return createStaticHTMLCollection(getNonPatchedFilteredArrayOfNodes(this, elements));
            },
            writable: true,
            enumerable: true,
            configurable: true,
        },
    });
}
// IE11 extra patches for wrong prototypes
if (hasOwnProperty.call(HTMLElement.prototype, 'getElementsByClassName')) {
    defineProperty(HTMLElement.prototype, 'getElementsByClassName', getOwnPropertyDescriptor(Element.prototype, 'getElementsByClassName'));
}

/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const FocusableSelector = `
    [contenteditable],
    [tabindex],
    a[href],
    area[href],
    audio[controls],
    button,
    iframe,
    input,
    select,
    textarea,
    video[controls]
`;
const formElementTagNames = new Set(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']);
function filterSequentiallyFocusableElements(elements) {
    return elements.filter((element) => {
        if (hasAttribute.call(element, 'tabindex')) {
            // Even though LWC only supports tabindex values of 0 or -1,
            // passing through elements with tabindex="0" is a tighter criteria
            // than filtering out elements based on tabindex="-1".
            return getAttribute.call(element, 'tabindex') === '0';
        }
        if (formElementTagNames.has(tagNameGetter.call(element))) {
            return !hasAttribute.call(element, 'disabled');
        }
        return true;
    });
}
const DidAddMouseEventListeners = new WeakMap();
// Due to browser differences, it is impossible to know what is focusable until
// we actually try to focus it. We need to refactor our focus delegation logic
// to verify whether or not the target was actually focused instead of trying
// to predict focusability like we do here.
function isVisible(element) {
    const { width, height } = getBoundingClientRect.call(element);
    const noZeroSize = width > 0 || height > 0;
    // The area element can be 0x0 and focusable. Hardcoding this is not ideal
    // but it will minimize changes in the current behavior.
    const isAreaElement = element.tagName === 'AREA';
    return (noZeroSize || isAreaElement) && getComputedStyle(element).visibility !== 'hidden';
}
// This function based on https://allyjs.io/data-tables/focusable.html
// It won't catch everything, but should be good enough
// There are a lot of edge cases here that we can't realistically handle
// Determines if a particular element is tabbable, as opposed to simply focusable
function isTabbable(element) {
    if (isSyntheticShadowHost(element) && isDelegatingFocus(element)) {
        return false;
    }
    return matches.call(element, FocusableSelector) && isVisible(element);
}
function hostElementFocus() {
    const _rootNode = this.getRootNode();
    if (_rootNode === this) {
        // We invoke the focus() method even if the host is disconnected in order to eliminate
        // observable differences for component authors between synthetic and native.
        const focusable = querySelector.call(this, FocusableSelector);
        if (!isNull(focusable)) {
            // @ts-expect-error type-mismatch
            focusable.focus.apply(focusable, arguments);
        }
        return;
    }
    // If the root node is not the host element then it's either the document or a shadow root.
    const rootNode = _rootNode;
    if (rootNode.activeElement === this) {
        // The focused element should not change if the focus method is invoked
        // on the shadow-including ancestor of the currently focused element.
        return;
    }
    const focusables = arrayFromCollection(querySelectorAll$1.call(this, FocusableSelector));
    let didFocus = false;
    while (!didFocus && focusables.length !== 0) {
        const focusable = focusables.shift();
        // @ts-expect-error type-mismatch
        focusable.focus.apply(focusable, arguments);
        // Get the root node of the current focusable in case it was slotted.
        const currentRootNode = focusable.getRootNode();
        didFocus = currentRootNode.activeElement === focusable;
    }
}
function getTabbableSegments(host) {
    const doc = getOwnerDocument(host);
    const all = filterSequentiallyFocusableElements(arrayFromCollection(querySelectorAll.call(doc, FocusableSelector)));
    const inner = filterSequentiallyFocusableElements(arrayFromCollection(querySelectorAll$1.call(host, FocusableSelector)));
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(getAttribute.call(host, 'tabindex') === '-1' || isDelegatingFocus(host), `The focusin event is only relevant when the tabIndex property is -1 on the host.`);
    }
    const firstChild = inner[0];
    const lastChild = inner[inner.length - 1];
    const hostIndex = ArrayIndexOf.call(all, host);
    // Host element can show up in our "previous" section if its tabindex is 0
    // We want to filter that out here
    const firstChildIndex = hostIndex > -1 ? hostIndex : ArrayIndexOf.call(all, firstChild);
    // Account for an empty inner list
    const lastChildIndex = inner.length === 0 ? firstChildIndex + 1 : ArrayIndexOf.call(all, lastChild) + 1;
    const prev = ArraySlice.call(all, 0, firstChildIndex);
    const next = ArraySlice.call(all, lastChildIndex);
    return {
        prev,
        inner,
        next,
    };
}
function getActiveElement(host) {
    const doc = getOwnerDocument(host);
    const activeElement = DocumentPrototypeActiveElement.call(doc);
    if (isNull(activeElement)) {
        return activeElement;
    }
    // activeElement must be child of the host and owned by it
    return (compareDocumentPosition.call(host, activeElement) & DOCUMENT_POSITION_CONTAINED_BY) !==
        0
        ? activeElement
        : null;
}
function relatedTargetPosition(host, relatedTarget) {
    // assert: target must be child of host
    const pos = compareDocumentPosition.call(host, relatedTarget);
    if (pos & DOCUMENT_POSITION_CONTAINED_BY) {
        // focus remains inside the host
        return 0;
    }
    else if (pos & DOCUMENT_POSITION_PRECEDING) {
        // focus is coming from above
        return 1;
    }
    else if (pos & DOCUMENT_POSITION_FOLLOWING) {
        // focus is coming from below
        return 2;
    }
    // we don't know what's going on.
    return -1;
}
function muteEvent(event) {
    event.preventDefault();
    event.stopPropagation();
}
function muteFocusEventsDuringExecution(win, func) {
    windowAddEventListener.call(win, 'focusin', muteEvent, true);
    windowAddEventListener.call(win, 'focusout', muteEvent, true);
    func();
    windowRemoveEventListener.call(win, 'focusin', muteEvent, true);
    windowRemoveEventListener.call(win, 'focusout', muteEvent, true);
}
function focusOnNextOrBlur(segment, target, relatedTarget) {
    const win = getOwnerWindow(relatedTarget);
    const next = getNextTabbable(segment, relatedTarget);
    if (isNull(next)) {
        // nothing to focus on, blur to invalidate the operation
        muteFocusEventsDuringExecution(win, () => {
            target.blur();
        });
    }
    else {
        muteFocusEventsDuringExecution(win, () => {
            next.focus();
        });
    }
}
let letBrowserHandleFocus = false;
function disableKeyboardFocusNavigationRoutines() {
    letBrowserHandleFocus = true;
}
function enableKeyboardFocusNavigationRoutines() {
    letBrowserHandleFocus = false;
}
function isKeyboardFocusNavigationRoutineEnabled() {
    return !letBrowserHandleFocus;
}
function skipHostHandler(event) {
    if (letBrowserHandleFocus) {
        return;
    }
    const host = eventCurrentTargetGetter.call(event);
    const target = eventTargetGetter.call(event);
    // If the host delegating focus with tabindex=0 is not the target, we know
    // that the event was dispatched on a descendant node of the host. This
    // means the focus is coming from below and we don't need to do anything.
    if (host !== target) {
        // Focus is coming from above
        return;
    }
    const relatedTarget = focusEventRelatedTargetGetter.call(event);
    if (isNull(relatedTarget)) {
        // If relatedTarget is null, the user is most likely tabbing into the document from the
        // browser chrome. We could probably deduce whether focus is coming in from the top or the
        // bottom by comparing the position of the target to all tabbable elements. This is an edge
        // case and only comes up if the custom element is the first or last tabbable element in the
        // document.
        return;
    }
    const segments = getTabbableSegments(host);
    const position = relatedTargetPosition(host, relatedTarget);
    if (position === 1) {
        // Focus is coming from above
        const findTabbableElms = isTabbableFrom.bind(null, host.getRootNode());
        const first = ArrayFind.call(segments.inner, findTabbableElms);
        if (!isUndefined(first)) {
            const win = getOwnerWindow(first);
            muteFocusEventsDuringExecution(win, () => {
                first.focus();
            });
        }
        else {
            focusOnNextOrBlur(segments.next, target, relatedTarget);
        }
    }
    else if (host === target) {
        // Host is receiving focus from below, either from its shadow or from a sibling
        focusOnNextOrBlur(ArrayReverse.call(segments.prev), target, relatedTarget);
    }
}
function skipShadowHandler(event) {
    if (letBrowserHandleFocus) {
        return;
    }
    const relatedTarget = focusEventRelatedTargetGetter.call(event);
    if (isNull(relatedTarget)) {
        // If relatedTarget is null, the user is most likely tabbing into the document from the
        // browser chrome. We could probably deduce whether focus is coming in from the top or the
        // bottom by comparing the position of the target to all tabbable elements. This is an edge
        // case and only comes up if the custom element is the first or last tabbable element in the
        // document.
        return;
    }
    const host = eventCurrentTargetGetter.call(event);
    const segments = getTabbableSegments(host);
    if (ArrayIndexOf.call(segments.inner, relatedTarget) !== -1) {
        // If relatedTarget is contained by the host's subtree we can assume that the user is
        // tabbing between elements inside of the shadow. Do nothing.
        return;
    }
    const target = eventTargetGetter.call(event);
    // Determine where the focus is coming from (Tab or Shift+Tab)
    const position = relatedTargetPosition(host, relatedTarget);
    if (position === 1) {
        // Focus is coming from above
        focusOnNextOrBlur(segments.next, target, relatedTarget);
    }
    if (position === 2) {
        // Focus is coming from below
        focusOnNextOrBlur(ArrayReverse.call(segments.prev), target, relatedTarget);
    }
}
// Use this function to determine whether you can start from one root and end up
// at another element via tabbing.
function isTabbableFrom(fromRoot, toElm) {
    if (!isTabbable(toElm)) {
        return false;
    }
    const ownerDocument = getOwnerDocument(toElm);
    let root = toElm.getRootNode();
    while (root !== ownerDocument && root !== fromRoot) {
        const sr = root;
        const host = sr.host;
        if (getAttribute.call(host, 'tabindex') === '-1') {
            return false;
        }
        root = host && host.getRootNode();
    }
    return true;
}
function getNextTabbable(tabbables, relatedTarget) {
    const len = tabbables.length;
    if (len > 0) {
        for (let i = 0; i < len; i += 1) {
            const next = tabbables[i];
            if (isTabbableFrom(relatedTarget.getRootNode(), next)) {
                return next;
            }
        }
    }
    return null;
}
// Skips the host element
function handleFocus(elm) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isDelegatingFocus(elm), `Invalid attempt to handle focus event for ${toString(elm)}. ${toString(elm)} should have delegates focus true, but is not delegating focus`);
    }
    bindDocumentMousedownMouseupHandlers(elm);
    // Unbind any focusin listeners we may have going on
    ignoreFocusIn(elm);
    addEventListener.call(elm, 'focusin', skipHostHandler, true);
}
function ignoreFocus(elm) {
    removeEventListener.call(elm, 'focusin', skipHostHandler, true);
}
function bindDocumentMousedownMouseupHandlers(elm) {
    const ownerDocument = getOwnerDocument(elm);
    if (!DidAddMouseEventListeners.get(ownerDocument)) {
        DidAddMouseEventListeners.set(ownerDocument, true);
        addEventListener.call(ownerDocument, 'mousedown', disableKeyboardFocusNavigationRoutines, true);
        addEventListener.call(ownerDocument, 'mouseup', () => {
            // We schedule this as an async task in the mouseup handler (as
            // opposed to the mousedown handler) because we want to guarantee
            // that it will never run before the focusin handler:
            //
            // Click form element   | Click form element label
            // ==================================================
            // mousedown            | mousedown
            // FOCUSIN              | mousedown-setTimeout
            // mousedown-setTimeout | mouseup
            // mouseup              | FOCUSIN
            // mouseup-setTimeout   | mouseup-setTimeout
            setTimeout(enableKeyboardFocusNavigationRoutines);
        }, true);
        // [W-7824445] If the element is draggable, the mousedown event is dispatched before the
        // element is starting to be dragged, which disable the keyboard focus navigation routine.
        // But by specification, the mouseup event is never dispatched once the element is dropped.
        //
        // For all draggable element, we need to add an event listener to re-enable the keyboard
        // navigation routine after dragging starts.
        addEventListener.call(ownerDocument, 'dragstart', enableKeyboardFocusNavigationRoutines, true);
    }
}
// Skips the shadow tree
function handleFocusIn(elm) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(tabIndexGetter.call(elm) === -1, `Invalid attempt to handle focus in  ${toString(elm)}. ${toString(elm)} should have tabIndex -1, but has tabIndex ${tabIndexGetter.call(elm)}`);
    }
    bindDocumentMousedownMouseupHandlers(elm);
    // Unbind any focus listeners we may have going on
    ignoreFocus(elm);
    // This focusin listener is to catch focusin events from keyboard interactions
    // A better solution would perhaps be to listen for keydown events, but
    // the keydown event happens on whatever element already has focus (or no element
    // at all in the case of the location bar. So, instead we have to assume that focusin
    // without a mousedown means keyboard navigation
    addEventListener.call(elm, 'focusin', skipShadowHandler, true);
}
function ignoreFocusIn(elm) {
    removeEventListener.call(elm, 'focusin', skipShadowHandler, true);
}

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { blur, focus } = HTMLElement.prototype;
/**
 * This method only applies to elements with a shadow attached to them
 */
function tabIndexGetterPatched() {
    if (isDelegatingFocus(this) && isFalse(hasAttribute.call(this, 'tabindex'))) {
        // this covers the case where the default tabindex should be 0 because the
        // custom element is delegating its focus
        return 0;
    }
    return tabIndexGetter.call(this);
}
/**
 * This method only applies to elements with a shadow attached to them
 * @param value
 */
function tabIndexSetterPatched(value) {
    // This tabIndex setter might be confusing unless it is understood that HTML
    // elements have default tabIndex property values. Natively focusable elements have
    // a default tabIndex value of 0 and all other elements have a default tabIndex
    // value of -1. For example, the tabIndex property value is -1 for both <x-foo> and
    // <x-foo tabindex="-1">, but our delegatesFocus polyfill should only kick in for
    // the latter case when the value of the tabindex attribute is -1.
    const delegatesFocus = isDelegatingFocus(this);
    // Record the state of things before invoking component setter.
    const prevValue = tabIndexGetter.call(this);
    const prevHasAttr = hasAttribute.call(this, 'tabindex');
    tabIndexSetter.call(this, value);
    // Record the state of things after invoking component setter.
    const currValue = tabIndexGetter.call(this);
    const currHasAttr = hasAttribute.call(this, 'tabindex');
    const didValueChange = prevValue !== currValue;
    // If the tabindex attribute is initially rendered, we can assume that this setter has
    // previously executed and a listener has been added. We must remove that listener if
    // the tabIndex property value has changed or if the component no longer renders a
    // tabindex attribute.
    if (prevHasAttr && (didValueChange || isFalse(currHasAttr))) {
        if (prevValue === -1) {
            ignoreFocusIn(this);
        }
        if (prevValue === 0 && delegatesFocus) {
            ignoreFocus(this);
        }
    }
    // If a tabindex attribute was not rendered after invoking its setter, it means the
    // component is taking control. Do nothing.
    if (isFalse(currHasAttr)) {
        return;
    }
    // If the tabindex attribute is initially rendered, we can assume that this setter has
    // previously executed and a listener has been added. If the tabindex attribute is still
    // rendered after invoking the setter AND the tabIndex property value has not changed,
    // we don't need to do any work.
    if (prevHasAttr && currHasAttr && isFalse(didValueChange)) {
        return;
    }
    // At this point we know that a tabindex attribute was rendered after invoking the
    // setter and that either:
    // 1) This is the first time this setter is being invoked.
    // 2) This is not the first time this setter is being invoked and the value is changing.
    // We need to add the appropriate listeners in either case.
    if (currValue === -1) {
        // Add the magic to skip the shadow tree
        handleFocusIn(this);
    }
    if (currValue === 0 && delegatesFocus) {
        // Add the magic to skip the host element
        handleFocus(this);
    }
}
/**
 * This method only applies to elements with a shadow attached to them
 */
function blurPatched() {
    if (isDelegatingFocus(this)) {
        const currentActiveElement = getActiveElement(this);
        if (!isNull(currentActiveElement)) {
            // if there is an active element, blur it (intentionally using the dot notation in case the user defines the blur routine)
            currentActiveElement.blur();
            return;
        }
    }
    return blur.call(this);
}
function focusPatched() {
    // Save enabled state
    const originallyEnabled = isKeyboardFocusNavigationRoutineEnabled();
    // Change state by disabling if originally enabled
    if (originallyEnabled) {
        disableKeyboardFocusNavigationRoutines();
    }
    if (isSyntheticShadowHost(this) && isDelegatingFocus(this)) {
        hostElementFocus.call(this);
        return;
    }
    // Typescript does not like it when you treat the `arguments` object as an array
    // @ts-expect-error type-mismatch
    focus.apply(this, arguments);
    // Restore state by enabling if originally enabled
    if (originallyEnabled) {
        enableKeyboardFocusNavigationRoutines();
    }
}
// Non-deep-traversing patches: this descriptor map includes all descriptors that
// do not five access to nodes beyond the immediate children.
defineProperties(HTMLElement.prototype, {
    tabIndex: {
        get() {
            if (isSyntheticShadowHost(this)) {
                return tabIndexGetterPatched.call(this);
            }
            return tabIndexGetter.call(this);
        },
        set(v) {
            if (isSyntheticShadowHost(this)) {
                return tabIndexSetterPatched.call(this, v);
            }
            return tabIndexSetter.call(this, v);
        },
        enumerable: true,
        configurable: true,
    },
    blur: {
        value() {
            if (isSyntheticShadowHost(this)) {
                return blurPatched.call(this);
            }
            blur.call(this);
        },
        enumerable: true,
        writable: true,
        configurable: true,
    },
    focus: {
        value() {
            // Typescript does not like it when you treat the `arguments` object as an array
            // @ts-expect-error type-mismatch
            focusPatched.apply(this, arguments);
        },
        enumerable: true,
        writable: true,
        configurable: true,
    },
});
// Note: In JSDOM innerText is not implemented: https://github.com/jsdom/jsdom/issues/1245
if (innerTextGetter !== null && innerTextSetter !== null) {
    defineProperty(HTMLElement.prototype, 'innerText', {
        get() {
            // Note: we deviate from native shadow here, but are not fixing
            // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
            return innerTextGetter.call(this);
        },
        set(v) {
            innerTextSetter.call(this, v);
        },
        enumerable: true,
        configurable: true,
    });
}
// Note: Firefox does not have outerText, https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/outerText
if (outerTextGetter !== null && outerTextSetter !== null) {
    // From https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/outerText :
    // HTMLElement.outerText is a non-standard property. As a getter, it returns the same value as Node.innerText.
    // As a setter, it removes the current node and replaces it with the given text.
    defineProperty(HTMLElement.prototype, 'outerText', {
        get() {
            // Note: we deviate from native shadow here, but are not fixing
            // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
            return outerTextGetter.call(this);
        },
        set(v) {
            // Invoking the `outerText` setter on a host element should trigger its disconnection, but until we merge node reactions, it will not work.
            // We could reimplement the outerText setter in JavaScript ([blink implementation](https://source.chromium.org/chromium/chromium/src/+/master:third_party/blink/renderer/core/html/html_element.cc;l=841-879;drc=6e8b402a6231405b753919029c9027404325ea00;bpv=0;bpt=1))
            // but the benefits don't worth the efforts.
            outerTextSetter.call(this, v);
        },
        enumerable: true,
        configurable: true,
    });
}

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
function getShadowToken(node) {
    return node[KEY__SHADOW_TOKEN];
}
function setShadowToken(node, shadowToken) {
    node[KEY__SHADOW_TOKEN] = shadowToken;
}
/**
 * Patching Element.prototype.$shadowToken$ to mark elements a portal:
 * - we use a property to allow engines to set a custom attribute that should be
 * placed into the element to sandbox the css rules defined for the template.
 * - this custom attribute must be unique.
 */
defineProperty(Element.prototype, KEY__SHADOW_TOKEN, {
    set(shadowToken) {
        const oldShadowToken = this[KEY__SHADOW_TOKEN_PRIVATE];
        if (!isUndefined(oldShadowToken) && oldShadowToken !== shadowToken) {
            removeAttribute.call(this, oldShadowToken);
        }
        if (!isUndefined(shadowToken)) {
            setAttribute.call(this, shadowToken, '');
        }
        this[KEY__SHADOW_TOKEN_PRIVATE] = shadowToken;
    },
    get() {
        return this[KEY__SHADOW_TOKEN_PRIVATE];
    },
    configurable: true,
});
function recursivelySetShadowResolver(node, fn) {
    node[KEY__SHADOW_RESOLVER] = fn;
    // Recurse using firstChild/nextSibling because browsers use a linked list under the hood to
    // represent the DOM, so childNodes/children would cause an unnecessary array allocation.
    // https://viethung.space/blog/2020/09/01/Browser-from-Scratch-DOM-API/#Choosing-DOM-tree-data-structure
    let child = firstChildGetter.call(node);
    while (!isNull(child)) {
        recursivelySetShadowResolver(child, fn);
        child = nextSiblingGetter.call(child);
    }
}
defineProperty(Element.prototype, KEY__SHADOW_STATIC, {
    set(v) {
        // Marking an element as static will propagate the shadow resolver to the children.
        if (v) {
            const fn = this[KEY__SHADOW_RESOLVER];
            recursivelySetShadowResolver(this, fn);
        }
        this[KEY__SHADOW_STATIC_PRIVATE] = v;
    },
    get() {
        return this[KEY__SHADOW_STATIC_PRIVATE];
    },
    configurable: true,
});

/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// TODO [#3733]: remove this entire file when we can remove legacy scope tokens
function getLegacyShadowToken(node) {
    return node[KEY__LEGACY_SHADOW_TOKEN];
}
function setLegacyShadowToken(node, shadowToken) {
    node[KEY__LEGACY_SHADOW_TOKEN] = shadowToken;
}
/**
 * Patching Element.prototype.$legacyShadowToken$ to mark elements a portal:
 * Same as $shadowToken$ but for legacy CSS scope tokens.
 */
defineProperty(Element.prototype, KEY__LEGACY_SHADOW_TOKEN, {
    set(shadowToken) {
        const oldShadowToken = this[KEY__LEGACY_SHADOW_TOKEN_PRIVATE];
        if (!isUndefined(oldShadowToken) && oldShadowToken !== shadowToken) {
            removeAttribute.call(this, oldShadowToken);
        }
        if (!isUndefined(shadowToken)) {
            setAttribute.call(this, shadowToken, '');
        }
        this[KEY__LEGACY_SHADOW_TOKEN_PRIVATE] = shadowToken;
    },
    get() {
        return this[KEY__LEGACY_SHADOW_TOKEN_PRIVATE];
    },
    configurable: true,
});

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const DomManualPrivateKey = '$$DomManualKey$$';
// Resolver function used when a node is removed from within a portal
const DocumentResolverFn = function () { };
// We can use a single observer without having to worry about leaking because
// "Registered observers in a node’s registered observer list have a weak
// reference to the node."
// https://dom.spec.whatwg.org/#garbage-collection
let portalObserver;
const portalObserverConfig = {
    childList: true,
};
// TODO [#3733]: remove support for legacy scope tokens
function adoptChildNode(node, fn, shadowToken, legacyShadowToken) {
    const previousNodeShadowResolver = getShadowRootResolver(node);
    if (previousNodeShadowResolver === fn) {
        return; // nothing to do here, it is already correctly patched
    }
    setShadowRootResolver(node, fn);
    if (node instanceof Element) {
        setShadowToken(node, shadowToken);
        if (lwcRuntimeFlags.ENABLE_LEGACY_SCOPE_TOKENS) {
            setLegacyShadowToken(node, legacyShadowToken);
        }
        if (isSyntheticShadowHost(node)) {
            // Root LWC elements can't get content slotted into them, therefore we don't observe their children.
            return;
        }
        if (isUndefined(previousNodeShadowResolver)) {
            // we only care about Element without shadowResolver (no MO.observe has been called)
            MutationObserverObserve.call(portalObserver, node, portalObserverConfig);
        }
        // recursively patching all children as well
        const childNodes = childNodesGetter.call(node);
        for (let i = 0, len = childNodes.length; i < len; i += 1) {
            adoptChildNode(childNodes[i], fn, shadowToken, legacyShadowToken);
        }
    }
}
function initPortalObserver() {
    return new MO((mutations) => {
        forEach.call(mutations, (mutation) => {
            /**
             * This routine will process all nodes added or removed from elm (which is marked as a portal)
             * When adding a node to the portal element, we should add the ownership.
             * When removing a node from the portal element, this ownership should be removed.
             *
             * There is some special cases in which MutationObserver may call with stacked mutations (the same node
             * will be in addedNodes and removedNodes) or with false positives (a node that is removed and re-appended
             * in the same tick) for those cases, we cover by checking that the node is contained
             * (or not in the case of removal) by the element.
             */
            const { target: elm, addedNodes, removedNodes } = mutation;
            // the target of the mutation should always have a ShadowRootResolver attached to it
            const fn = getShadowRootResolver(elm);
            const shadowToken = getShadowToken(elm);
            const legacyShadowToken = lwcRuntimeFlags.ENABLE_LEGACY_SCOPE_TOKENS
                ? getLegacyShadowToken(elm)
                : undefined;
            // Process removals first to handle the case where an element is removed and reinserted
            for (let i = 0, len = removedNodes.length; i < len; i += 1) {
                const node = removedNodes[i];
                if (!(compareDocumentPosition.call(elm, node) & _Node.DOCUMENT_POSITION_CONTAINED_BY)) {
                    adoptChildNode(node, DocumentResolverFn, undefined, undefined);
                }
            }
            for (let i = 0, len = addedNodes.length; i < len; i += 1) {
                const node = addedNodes[i];
                if (compareDocumentPosition.call(elm, node) & _Node.DOCUMENT_POSITION_CONTAINED_BY) {
                    adoptChildNode(node, fn, shadowToken, legacyShadowToken);
                }
            }
        });
    });
}
function markElementAsPortal(elm) {
    if (isUndefined(portalObserver)) {
        portalObserver = initPortalObserver();
    }
    if (isUndefined(getShadowRootResolver(elm))) {
        // only an element from a within a shadowRoot should be used here
        throw new Error(`Invalid Element`);
    }
    // install mutation observer for portals
    MutationObserverObserve.call(portalObserver, elm, portalObserverConfig);
    // TODO [#1253]: optimization to synchronously adopt new child nodes added
    // to this elm, we can do that by patching the most common operations
    // on the node itself
}
/**
 * Patching Element.prototype.$domManual$ to mark elements as portal:
 * - we use a property to allow engines to signal that a particular element in
 * a shadow supports manual insertion of child nodes.
 * - this signal comes as a boolean value, and we use it to install the MO instance
 * onto the element, to propagate the $ownerKey$ and $shadowToken$ to all new
 * child nodes.
 * - at the moment, there is no way to undo this operation, once the element is
 * marked as $domManual$, setting it to false does nothing.
 */
// TODO [#1306]: rename this to $observerConnection$
defineProperty(Element.prototype, '$domManual$', {
    set(v) {
        this[DomManualPrivateKey] = v;
        if (isTrue(v)) {
            markElementAsPortal(this);
        }
    },
    get() {
        return this[DomManualPrivateKey];
    },
    configurable: true,
});
/** version: 8.24.0 */
}
//# sourceMappingURL=index.js.map
