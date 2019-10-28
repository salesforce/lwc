/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    assert,
    ArrayIndexOf,
    ArrayPush,
    fields,
    forEach,
    isUndefined,
    isTrue,
    ArrayFilter,
    isNull,
    ArrayReduce,
    defineProperties,
    isFalse,
    isFunction,
    ArraySplice,
} from '@lwc/shared';
import { getAttribute, setAttribute } from '../env/element';
import { dispatchEvent } from '../env/dom';
import { MutationObserverObserve, MutationObserver } from '../env/mutation-observer';
import {
    isSlotElement,
    getNodeOwner,
    getAllMatches,
    getFilteredChildNodes,
    getFilteredSlotAssignedNodes,
} from '../faux-shadow/traverse';
import {
    childNodesGetter,
    parentNodeGetter,
    insertBefore,
    removeChild,
    appendChild,
    replaceChild,
} from '../env/node';
import { createStaticNodeList } from '../shared/static-node-list';
import { isNodeShadowed, getNodeNearestOwnerKey, getInternalChildNodes } from '../faux-shadow/node';
import { arrayFromCollection } from '../shared/utils';
import { getShadowRootResolver, getShadowRootRecord, SlottedNodeRecord } from './shadow-root';

// We can use a single observer without having to worry about leaking because
// "Registered observers in a node’s registered observer list have a weak
// reference to the node."
// https://dom.spec.whatwg.org/#garbage-collection
let observer;

const { createFieldName, getHiddenField, setHiddenField } = fields;
const observerConfig: MutationObserverInit = { childList: true };
const SlotChangeKey = createFieldName('slotchange', 'synthetic-shadow');

function initSlotObserver() {
    return new MutationObserver(mutations => {
        const slots: Node[] = [];
        forEach.call(mutations, mutation => {
            if (process.env.NODE_ENV !== 'production') {
                assert.invariant(
                    mutation.type === 'childList',
                    `Invalid mutation type: ${
                        mutation.type
                    }. This mutation handler for slots should only handle "childList" mutations.`
                );
            }
            const { target: slot } = mutation;
            if (ArrayIndexOf.call(slots, slot) === -1) {
                ArrayPush.call(slots, slot);
                dispatchEvent.call(slot, new CustomEvent('slotchange'));
            }
        });
    });
}

function getFilteredSlotFlattenNodes(slot: HTMLElement): Node[] {
    const childNodes = arrayFromCollection(childNodesGetter.call(slot));
    // Typescript is inferring the wrong function type for this particular
    // overloaded method: https://github.com/Microsoft/TypeScript/issues/27972
    // @ts-ignore type-mismatch
    return ArrayReduce.call(
        childNodes,
        (seed, child) => {
            if (child instanceof Element && isSlotElement(child)) {
                ArrayPush.apply(seed, getFilteredSlotFlattenNodes(child as HTMLElement));
            } else {
                ArrayPush.call(seed, child);
            }
            return seed;
        },
        []
    );
}

interface SlotMeta {
    distributed: boolean;
    fragment: DocumentFragment;
}

const slotMetaMap: WeakMap<HTMLSlotElement, SlotMeta> = new WeakMap();

function getSlotMeta(slotElm: HTMLSlotElement): SlotMeta {
    let meta = slotMetaMap.get(slotElm);
    if (isUndefined(meta)) {
        meta = {
            distributed: false,
            fragment: document.createDocumentFragment(),
        };
    }
    return meta;
}

function getDefaultContentFragment(slotElm: HTMLSlotElement): HTMLSlotElement | DocumentFragment {
    const meta = getSlotMeta(slotElm);
    return isTrue(meta.distributed) ? meta.fragment : slotElm;
}

function distSlottedNodesIntoSlotElement(
    slotElm: HTMLSlotElement,
    slottedNodeRecords: SlottedNodeRecord[]
) {
    const { name = '' } = slotElm;
    for (let i = 0, len = slottedNodeRecords.length; i < len; i += 1) {
        const { 0: node, 1: nameOnRec } = slottedNodeRecords[i];
        if (nameOnRec === name) {
            appendChild.call(slotElm, node);
        }
    }
}

function findSlottedRecordIndex(node: Node, slottedNodeRecords: SlottedNodeRecord[]): number {
    for (let i = 0, len = slottedNodeRecords.length; i < len; i += 1) {
        const record = slottedNodeRecords[i];
        if (record[0] === node) {
            return i;
        }
    }
    return -1;
}

export function insertIntoSlot<T extends Node>(
    slotElm: HTMLSlotElement,
    newChild: T,
    refChild: Node | null
) {
    const meta = getSlotMeta(slotElm);
    if (isFalse(meta.distributed)) {
        // switching from default content to distributed content and storing the
        // default fragment in case we have to restore the default content
        const childNodes = getInternalChildNodes(slotElm);
        for (let i = 0, len = childNodes.length; i < len; i += 1) {
            appendChild.call(meta.fragment, childNodes[i]);
        }
        meta.distributed = true;
    }
    insertBefore.call(slotElm, newChild, refChild);
}

export function removeFromSlot<T extends Node>(slotElm: HTMLSlotElement, oldChild: T) {
    const meta = getSlotMeta(slotElm);
    removeChild.call(slotElm, oldChild);
    if (isTrue(meta.distributed) && getInternalChildNodes(slotElm).length === 0) {
        // no more distributed content, we fallback to the stored default fragment
        appendChild.call(slotElm, meta.fragment);
        meta.distributed = false;
    }
}

export function assignedSlotGetterPatched(this: Element): HTMLSlotElement | null {
    const parentNode = parentNodeGetter.call(this);
    /**
     * if it doesn't have a parent node,
     * or the parent is not an slot element
     * or they both belong to the same template (default content)
     * we should assume that it is not slotted
     */
    if (
        isNull(parentNode) ||
        !isSlotElement(parentNode) ||
        getNodeNearestOwnerKey(parentNode) === getNodeNearestOwnerKey(this)
    ) {
        return null;
    }
    return parentNode as HTMLSlotElement;
}

defineProperties(HTMLSlotElement.prototype, {
    addEventListener: {
        value(
            this: HTMLSlotElement,
            type: string,
            listener: EventListener,
            options?: boolean | AddEventListenerOptions
        ) {
            // super.addEventListener - but that doesn't work with typescript
            HTMLElement.prototype.addEventListener.call(this, type, listener, options);
            if (
                isNodeShadowed(this) &&
                type === 'slotchange' &&
                !getHiddenField(this, SlotChangeKey)
            ) {
                setHiddenField(this, SlotChangeKey, true);
                if (!observer) {
                    observer = initSlotObserver();
                }
                MutationObserverObserve.call(observer, this as Node, observerConfig);
            }
        },
        writable: true,
        enumerable: true,
        configurable: true,
    },
    assignedElements: {
        value(this: HTMLSlotElement, options?: AssignedNodesOptions): Element[] {
            const flatten = !isUndefined(options) && isTrue(options.flatten);
            const nodes = flatten
                ? getFilteredSlotFlattenNodes(this)
                : getFilteredSlotAssignedNodes(this);
            return ArrayFilter.call(nodes, node => node instanceof Element);
        },
        writable: true,
        enumerable: true,
        configurable: true,
    },
    assignedNodes: {
        value(this: HTMLSlotElement, options?: AssignedNodesOptions): Node[] {
            const flatten = !isUndefined(options) && isTrue(options.flatten);
            return flatten ? getFilteredSlotFlattenNodes(this) : getFilteredSlotAssignedNodes(this);
        },
        writable: true,
        enumerable: true,
        configurable: true,
    },
    name: {
        get(this: HTMLSlotElement): string {
            const name = getAttribute.call(this, 'name');
            return isNull(name) ? '' : name;
        },
        set(this: HTMLSlotElement, value: string) {
            if (value !== '' || getAttribute.call(this, 'name') !== null) {
                // avoid setting the attribute if it is empty and was never set before
                setAttribute.call(this, 'name', value);
            }
            // compiler will always set the name property, even for default slot where it is empty string
            const fn = getShadowRootResolver(this);
            if (isFunction(fn)) {
                // slot came from template
                const meta = getShadowRootRecord(this);
                // storing a back-pointer from the shadowRoot to the slot element for
                // the given name
                meta.slotElements[value] = this;
                // distributing existing slotted elements into the slot when needed
                distSlottedNodesIntoSlotElement(this, meta.slottedRecords);
            }
        },
        enumerable: true,
        configurable: true,
    },
    childNodes: {
        get(this: HTMLSlotElement): NodeListOf<Node> {
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

    // slotting mechanism
    insertBefore: {
        writable: true,
        enumerable: true,
        configurable: true,
        value<T extends Node>(this: HTMLSlotElement, newChild: T, refChild: Node | null): T {
            const defaultContentFrag = getDefaultContentFragment(this);
            insertBefore.call(defaultContentFrag, newChild, refChild);
            return newChild;
        },
    },
    removeChild: {
        writable: true,
        enumerable: true,
        configurable: true,
        value<T extends Node>(this: HTMLSlotElement, oldChild: T): T {
            const defaultContentFrag = getDefaultContentFragment(this);
            removeChild.call(defaultContentFrag, oldChild);
            return oldChild;
        },
    },
    appendChild: {
        writable: true,
        enumerable: true,
        configurable: true,
        value<T extends Node>(this: HTMLSlotElement, newChild: T): T {
            const defaultContentFrag = getDefaultContentFragment(this);
            appendChild.call(defaultContentFrag, newChild);
            return newChild;
        },
    },
    replaceChild: {
        writable: true,
        enumerable: true,
        configurable: true,
        value<T extends Node>(this: HTMLSlotElement, newChild: Node, oldChild: T): T {
            const defaultContentFrag = getDefaultContentFragment(this);
            replaceChild.call(defaultContentFrag, newChild, oldChild);
            return oldChild;
        },
    },
});

function hostInsertBefore(
    slottedRecords: SlottedNodeRecord[],
    slotElements: Record<string, HTMLSlotElement>,
    nr: SlottedNodeRecord,
    slotName: string,
    refIndex: number
) {
    // insert right after ref
    ArraySplice.call(slottedRecords, refIndex, 0, nr);
    if (slotElements[slotName]) {
        // needs immediate allocation
        let refNode: Node | null = null;
        // trying to find a good ref that was attached to the same slot
        for (let i = refIndex + 1, len = slottedRecords.length; i < len; i += 1) {
            if (slottedRecords[i][1] === slotName) {
                refNode = slottedRecords[i][0];
                break;
            }
        }
        insertIntoSlot(slotElements[slotName], nr[0], refNode);
    }
}

function hostRemoveChild(
    slottedRecords: SlottedNodeRecord[],
    slotElements: Record<string, HTMLSlotElement>,
    slotName: string,
    index: number
) {
    // remove record from records
    const r = slottedRecords[index];
    ArraySplice.call(slottedRecords, index, 1);
    if (slotElements[slotName]) {
        // needs immediate removal from dom
        removeFromSlot(slotElements[slotName], r[0]);
    }
}

/**
 * This operation will add few methods to the host to attempt to control
 * the insertion and removal of child nodes that must be slotted into its
 * shadow root.
 *
 * Note: this method does not support innerHTML, and co., it only support
 *       regular dom manipulation methods.
 */
export function adoptHostToSupportSlotting(host: Element) {
    defineProperties(host, {
        insertBefore: {
            writable: true,
            enumerable: true,
            configurable: true,
            value<T extends Node>(this: Element, newChild: T, refChild: Node | null): T {
                const { slotElements, slottedRecords } = getShadowRootRecord(this);
                const slotName = (newChild as any).slot || '';
                const nr: SlottedNodeRecord = {
                    0: newChild,
                    1: slotName,
                };
                const refIndex = isNull(refChild)
                    ? slottedRecords.length - 1
                    : findSlottedRecordIndex(refChild, slottedRecords);
                if (refIndex === -1) {
                    throw new Error(`Failed to execute 'insertBefore' on 'Node': The node before
                        which the new node is to be inserted is not a child of this node.`);
                }
                hostInsertBefore(slottedRecords, slotElements, nr, slotName, refIndex);
                return newChild;
            },
        },
        removeChild: {
            writable: true,
            enumerable: true,
            configurable: true,
            value<T extends Node>(this: Element, oldChild: T): T {
                const { slotElements, slottedRecords } = getShadowRootRecord(this);
                const slotName = (oldChild as any).slot || '';
                const refIndex = findSlottedRecordIndex(oldChild, slottedRecords);
                if (refIndex === -1) {
                    throw new Error(`Failed to execute 'removeChild' on 'Node': The node to
                        be removed is not a child of this node.`);
                }
                hostRemoveChild(slottedRecords, slotElements, slotName, refIndex);
                return oldChild;
            },
        },
        appendChild: {
            writable: true,
            enumerable: true,
            configurable: true,
            value<T extends Node>(this: Element, newChild: T): T {
                const { slotElements, slottedRecords } = getShadowRootRecord(this);
                const slotName = (newChild as any).slot || '';
                const nr: SlottedNodeRecord = {
                    0: newChild,
                    1: slotName,
                };
                const refIndex = slottedRecords.length - 1;
                hostInsertBefore(slottedRecords, slotElements, nr, slotName, refIndex);
                return newChild;
            },
        },
        replaceChild: {
            writable: true,
            enumerable: true,
            configurable: true,
            value<T extends Node>(this: Element, newChild: Node, oldChild: T): T {
                const { slotElements, slottedRecords } = getShadowRootRecord(this);
                const slotName = (newChild as any).slot || '';
                const nr: SlottedNodeRecord = {
                    0: newChild,
                    1: slotName,
                };
                const refIndex = findSlottedRecordIndex(oldChild, slottedRecords);
                if (refIndex === -1) {
                    throw new Error(`The node to be replaced is not a child of this node.`);
                }
                hostRemoveChild(slottedRecords, slotElements, slotName, refIndex);
                hostInsertBefore(slottedRecords, slotElements, nr, slotName, refIndex);
                return oldChild;
            },
        },
    });
}
