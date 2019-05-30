/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from '../shared/assert';
import { getAttribute, childrenGetter, setAttribute } from '../env/element';
import { createFieldName, getInternalField, setInternalField } from '../shared/fields';
import { dispatchEvent } from '../env/dom';
import {
    ArrayIndexOf,
    ArrayPush,
    forEach,
    isUndefined,
    isTrue,
    ArrayFilter,
    ArraySlice,
    isNull,
    ArrayReduce,
    defineProperties,
} from '../shared/language';
import { MutationObserverObserve, MutationObserver } from '../env/mutation-observer';
import {
    isSlotElement,
    getNodeOwner,
    getAllMatches,
    getFilteredChildNodes,
    getFilteredSlotAssignedNodes,
} from '../faux-shadow/traverse';
import {
    childNodesGetter as nativeChildNodesGetter,
    childNodesGetter,
    parentNodeGetter,
} from '../env/node';
import { createStaticNodeList } from '../shared/static-node-list';
import { createStaticHTMLCollection } from '../shared/static-html-collection';
import { isNodeShadowed, getNodeNearestOwnerKey } from '../faux-shadow/node';

// We can use a single observer without having to worry about leaking because
// "Registered observers in a node’s registered observer list have a weak
// reference to the node."
// https://dom.spec.whatwg.org/#garbage-collection
let observer;

const observerConfig: MutationObserverInit = { childList: true };
const SlotChangeKey = createFieldName('slotchange');

function initSlotObserver() {
    return new MutationObserver(mutations => {
        const slots: Node[] = [];
        forEach.call(mutations, mutation => {
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(
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
    const childNodes = ArraySlice.call(nativeChildNodesGetter.call(slot)) as Node[];
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

defineProperties((window as any).HTMLSlotElement.prototype, {
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
                !getInternalField(this, SlotChangeKey)
            ) {
                if (process.env.NODE_ENV === 'test') {
                    /* eslint-disable-next-line no-console */
                    console.warn(
                        'The "slotchange" event is not supported in our jest test environment.'
                    );
                }
                setInternalField(this, SlotChangeKey, true);
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
            setAttribute.call(this, 'name', value);
        },
        enumerable: true,
        configurable: true,
    },
    childNodes: {
        get(this: HTMLSlotElement): NodeListOf<Node & Element> {
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
    children: {
        get(this: HTMLSlotElement): HTMLCollectionOf<Element> {
            // We cannot patch `children` in test mode
            // because JSDOM uses children for its "native"
            // querySelector implementation. If we patch this,
            // elm.querySelector() might not find any element.
            if (isNodeShadowed(this) && process.env.NODE_ENV === 'test') {
                // slot element inside a shadow
                const owner = getNodeOwner(this);
                const childNodes = isNull(owner)
                    ? []
                    : getAllMatches(owner, getFilteredChildNodes(this));
                return createStaticHTMLCollection(
                    ArrayFilter.call(childNodes, (node: Node | Element) => node instanceof Element)
                );
            }
            return childrenGetter.call(this);
        },
        enumerable: true,
        configurable: true,
    },
});
