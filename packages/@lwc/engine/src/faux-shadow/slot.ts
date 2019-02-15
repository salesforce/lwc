/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from "../shared/assert";
import { getAttribute, childrenGetter } from "../env/element";
import {
    createFieldName,
    getInternalField,
    setInternalField,
} from "../shared/fields";
import { dispatchEvent } from "../env/dom";
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
} from "../shared/language";
import {
    MutationObserverObserve,
    MutationObserver,
} from "../env/window";
import { PatchedElement, isSlotElement, isNodeOwnedBy, getNodeOwner, getAllMatches, getFilteredChildNodes } from "./traverse";
import { HTMLSlotElementConstructor } from "../framework/base-bridge-element";
import {
    childNodesGetter as nativeChildNodesGetter,
} from "../env/node";
import { createStaticNodeList } from "../shared/static-node-list";
import { createStaticHTMLCollection } from "../shared/static-html-collection";

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

export function getFilteredSlotAssignedNodes(slot: HTMLElement): Node[] {
    const owner = getNodeOwner(slot);
    if (isNull(owner)) {
        return [];
    }
    const childNodes = ArraySlice.call(nativeChildNodesGetter.call(slot)) as Node[];
    // Typescript is inferring the wrong function type for this particular
    // overloaded method: https://github.com/Microsoft/TypeScript/issues/27972
    // @ts-ignore type-mismatch
    return ArrayReduce.call(childNodes, (seed, child) => {
        if (!isNodeOwnedBy(owner, child)) {
            ArrayPush.call(seed, child);
        }
        return seed;
    }, []);
}

function getFilteredSlotFlattenNodes(slot: HTMLElement): Node[] {
    const childNodes = ArraySlice.call(nativeChildNodesGetter.call(slot)) as Node[];
    // Typescript is inferring the wrong function type for this particular
    // overloaded method: https://github.com/Microsoft/TypeScript/issues/27972
    // @ts-ignore type-mismatch
    return ArrayReduce.call(childNodes, (seed, child) => {
        if (child instanceof Element && isSlotElement(child)) {
            ArrayPush.apply(seed, getFilteredSlotFlattenNodes(child as HTMLElement));
        } else {
            ArrayPush.call(seed, child);
        }
        return seed;
    }, []);
}

interface AssignedNodesOptions {
    flatten?: boolean;
}

export function PatchedSlotElement(elm: HTMLSlotElement): HTMLSlotElementConstructor {
    const Ctor = PatchedElement(elm) as HTMLSlotElementConstructor;
    const { addEventListener: superAddEventListener } = elm;
    return class PatchedHTMLSlotElement extends Ctor {
        addEventListener(this: HTMLSlotElement, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
            if (type === 'slotchange' && !getInternalField(this, SlotChangeKey)) {
                if (process.env.NODE_ENV === 'test') {
                    /* eslint-disable-next-line no-console */
                    console.warn('The "slotchange" event is not supported in our jest test environment.');
                }
                setInternalField(this, SlotChangeKey, true);
                if (!observer) {
                    observer = initSlotObserver();
                }
                MutationObserverObserve.call(observer, this as Node, observerConfig);
            }
            superAddEventListener.call(this as HTMLSlotElement, type, listener, options);
        }
        assignedElements(this: HTMLSlotElement, options?: AssignedNodesOptions): Element[] {
            const flatten = !isUndefined(options) && isTrue(options.flatten);
            const nodes = flatten ? getFilteredSlotFlattenNodes(this) : getFilteredSlotAssignedNodes(this);
            return ArrayFilter.call(nodes, node => node instanceof Element);
        }
        assignedNodes(this: HTMLSlotElement, options?: AssignedNodesOptions): Node[] {
            const flatten = !isUndefined(options) && isTrue(options.flatten);
            return flatten ? getFilteredSlotFlattenNodes(this) : getFilteredSlotAssignedNodes(this);
        }
        get name(this: HTMLSlotElement): string {
            // in browsers that do not support shadow dom, slot's name attribute is not reflective
            const name = getAttribute.call(this, 'name');
            return isNull(name) ? '' : name;
        }
        get childNodes(this: HTMLSlotElement): NodeListOf<Node & Element> {
            const owner = getNodeOwner(this);
            const childNodes = isNull(owner) ? [] : getAllMatches(owner, getFilteredChildNodes(this));
            return createStaticNodeList(childNodes);
        }
        get children(this: HTMLSlotElement): HTMLCollectionOf<Element> {
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
            return createStaticHTMLCollection(ArrayFilter.call(childNodes, (node: Node | Element) => node instanceof Element));
        }
    };
}
