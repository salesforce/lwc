/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    assert,
    createHiddenField,
    defineProperties,
    ArrayFilter,
    ArrayIndexOf,
    ArrayPush,
    ArrayReduce,
    ArraySlice,
    forEach,
    getHiddenField,
    isNull,
    isTrue,
    isUndefined,
    setHiddenField,
} from '@lwc/shared';
import { getAttribute, setAttribute } from '../env/element';
import { dispatchEvent } from '../env/dom';
import {
    assignedNodes as originalAssignedNodes,
    assignedElements as originalAssignedElements,
} from '../env/slot';
import { MutationObserverObserve, MutationObserver } from '../env/mutation-observer';
import {
    isSlotElement,
    getNodeOwner,
    getAllMatches,
    getFilteredChildNodes,
    getFilteredSlotAssignedNodes,
} from '../faux-shadow/traverse';
import { childNodesGetter, parentNodeGetter } from '../env/node';
import { createStaticNodeList } from '../shared/static-node-list';
import { isNodeShadowed, getNodeNearestOwnerKey } from '../faux-shadow/node';
import { arrayFromCollection } from '../shared/utils';

// We can use a single observer without having to worry about leaking because
// "Registered observers in a node’s registered observer list have a weak
// reference to the node."
// https://dom.spec.whatwg.org/#garbage-collection
let observer: MutationObserver | undefined;

const observerConfig: MutationObserverInit = { childList: true };
const SlotChangeKey = createHiddenField<boolean>('slotchange', 'synthetic-shadow');

function initSlotObserver() {
    return new MutationObserver((mutations) => {
        const slots: Node[] = [];
        forEach.call(mutations, (mutation) => {
            if (process.env.NODE_ENV !== 'production') {
                assert.invariant(
                    mutation.type === 'childList',
                    `Invalid mutation type: ${mutation.type}. This mutation handler for slots should only handle "childList" mutations.`
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
            if (type === 'slotchange' && !getHiddenField(this, SlotChangeKey)) {
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
            if (isNodeShadowed(this)) {
                const flatten = !isUndefined(options) && isTrue(options.flatten);
                const nodes = flatten
                    ? getFilteredSlotFlattenNodes(this)
                    : getFilteredSlotAssignedNodes(this);
                return ArrayFilter.call(nodes, (node) => node instanceof Element);
            } else {
                return originalAssignedElements.apply(
                    this,
                    ArraySlice.call(arguments) as [AssignedNodesOptions]
                );
            }
        },
        writable: true,
        enumerable: true,
        configurable: true,
    },
    assignedNodes: {
        value(this: HTMLSlotElement, options?: AssignedNodesOptions): Node[] {
            if (isNodeShadowed(this)) {
                const flatten = !isUndefined(options) && isTrue(options.flatten);
                return flatten
                    ? getFilteredSlotFlattenNodes(this)
                    : getFilteredSlotAssignedNodes(this);
            } else {
                return originalAssignedNodes.apply(
                    this,
                    ArraySlice.call(arguments) as [AssignedNodesOptions]
                );
            }
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
            setAttribute.call(this, 'name', value);
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
});
