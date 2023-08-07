/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    assert,
    defineProperties,
    ArrayFilter,
    ArrayIndexOf,
    ArrayPush,
    ArrayReduce,
    ArraySlice,
    forEach,
    isNull,
    isTrue,
    isUndefined,
} from '@lwc/shared';
import {
    getAttribute,
    setAttribute,
    assignedSlotGetter as originalElementAssignedSlotGetter,
    shadowRootGetter,
} from '../env/element';
import { assignedSlotGetter as originalTextAssignedSlotGetter } from '../env/text';
import { dispatchEvent } from '../env/event-target';
import { MutationObserverObserve, MutationObserver } from '../env/mutation-observer';
import { childNodesGetter, parentNodeGetter } from '../env/node';
import {
    assignedNodes as originalAssignedNodes,
    assignedElements as originalAssignedElements,
} from '../env/slot';
import { isInstanceOfNativeShadowRoot } from '../env/shadow-root';
import {
    isSlotElement,
    getNodeOwner,
    getAllMatches,
    getFilteredChildNodes,
    getFilteredSlotAssignedNodes,
} from '../faux-shadow/traverse';
import { getNodeOwnerKey, isNodeShadowed } from '../shared/node-ownership';
import { createStaticNodeList } from '../shared/static-node-list';
import { arrayFromCollection } from '../shared/utils';

// We can use a single observer without having to worry about leaking because
// "Registered observers in a node’s registered observer list have a weak
// reference to the node."
// https://dom.spec.whatwg.org/#garbage-collection
let observer: MutationObserver | undefined;

const observerConfig: MutationObserverInit = { childList: true };
const SlotChangeKey = new WeakMap<any, boolean>();

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
                ArrayPush.apply(seed, getFilteredSlotFlattenNodes(child));
            } else {
                ArrayPush.call(seed, child);
            }
            return seed;
        },
        []
    );
}

export function assignedSlotGetterPatched(this: Element | Text): HTMLSlotElement | null {
    const parentNode = parentNodeGetter.call(this);

    // use original assignedSlot if parent has a native shdow root
    if (parentNode instanceof Element) {
        const sr = shadowRootGetter.call(parentNode);
        if (isInstanceOfNativeShadowRoot(sr)) {
            if (this instanceof Text) {
                return originalTextAssignedSlotGetter.call(this);
            }
            return originalElementAssignedSlotGetter.call(this);
        }
    }

    /**
     * The node is assigned to a slot if:
     *  - it has a parent and its parent is a slot element
     *  - and if the slot owner key is different than the node owner key.
     *
     * When the slot and the slotted node are 2 different shadow trees, the owner keys will be
     * different. When the slot is in a shadow tree and the slotted content is a light DOM node,
     * the light DOM node doesn't have an owner key and therefor the slot owner key will be
     * different than the node owner key (always `undefined`).
     */
    if (
        !isNull(parentNode) &&
        isSlotElement(parentNode) &&
        getNodeOwnerKey(parentNode) !== getNodeOwnerKey(this)
    ) {
        return parentNode;
    }

    return null;
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
