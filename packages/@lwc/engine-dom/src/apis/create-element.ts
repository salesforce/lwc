/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import features from '@lwc/features';
import { assert, assign, isFunction, isNull, isObject, isUndefined, toString } from '@lwc/shared';
import {
    createVM,
    connectRootElement,
    disconnectRootElement,
    LightningElement,
    getUpgradableConstructor,
} from '@lwc/engine-core';
import { renderer } from '../renderer';

// TODO [#2472]: Remove this workaround when appropriate.
// eslint-disable-next-line @lwc/lwc-internal/no-global-node
const _Node = Node;

type NodeSlotCallback = (element: Node) => void;

const ConnectingSlot = new WeakMap<any, NodeSlotCallback>();
const DisconnectingSlot = new WeakMap<any, NodeSlotCallback>();

function callNodeSlot(node: Node, slot: WeakMap<any, NodeSlotCallback>): Node {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(node, `callNodeSlot() should not be called for a non-object`);
    }

    const fn = slot.get(node);

    if (!isUndefined(fn)) {
        fn(node);
    }

    return node; // for convenience
}

if (!features.ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE) {
    // Monkey patching Node methods to be able to detect the insertions and removal of root elements
    // created via createElement.
    const { appendChild, insertBefore, removeChild, replaceChild } = _Node.prototype;
    assign(_Node.prototype, {
        appendChild(newChild) {
            const appendedNode = appendChild.call(this, newChild);
            return callNodeSlot(appendedNode, ConnectingSlot);
        },
        insertBefore(newChild, referenceNode) {
            const insertedNode = insertBefore.call(this, newChild, referenceNode);
            return callNodeSlot(insertedNode, ConnectingSlot);
        },
        removeChild(oldChild) {
            const removedNode = removeChild.call(this, oldChild);
            return callNodeSlot(removedNode, DisconnectingSlot);
        },
        replaceChild(newChild, oldChild) {
            const replacedNode = replaceChild.call(this, newChild, oldChild);
            callNodeSlot(replacedNode, DisconnectingSlot);
            callNodeSlot(newChild, ConnectingSlot);
            return replacedNode;
        },
    } as Pick<Node, 'appendChild' | 'insertBefore' | 'removeChild' | 'replaceChild'>);
}

/**
 * EXPERIMENTAL: This function is almost identical to document.createElement with the slightly
 * difference that in the options, you can pass the `is` property set to a Constructor instead of
 * just a string value. The intent is to allow the creation of an element controlled by LWC without
 * having to register the element as a custom element.
 *
 * @example
 * ```
 * const el = createElement('x-foo', { is: FooCtor });
 * ```
 */
export function createElement(
    sel: string,
    options: {
        is: typeof LightningElement;
        mode?: 'open' | 'closed';
    }
): HTMLElement {
    if (!isObject(options) || isNull(options)) {
        throw new TypeError(
            `"createElement" function expects an object as second parameter but received "${toString(
                options
            )}".`
        );
    }

    const Ctor = options.is;
    if (!isFunction(Ctor)) {
        throw new TypeError(
            `"createElement" function expects an "is" option with a valid component constructor.`
        );
    }

    const UpgradableConstructor = getUpgradableConstructor(sel, renderer);
    let wasComponentUpgraded: boolean = false;
    // the custom element from the registry is expecting an upgrade callback
    /**
     * Note: if the upgradable constructor does not expect, or throw when we new it
     * with a callback as the first argument, we could implement a more advanced
     * mechanism that only passes that argument if the constructor is known to be
     * an upgradable custom element.
     */
    const element = new UpgradableConstructor((elm: HTMLElement) => {
        createVM(elm, Ctor, renderer, {
            tagName: sel,
            mode: options.mode !== 'closed' ? 'open' : 'closed',
            owner: null,
        });
        if (!features.ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE) {
            ConnectingSlot.set(elm, connectRootElement);
            DisconnectingSlot.set(elm, disconnectRootElement);
        }
        wasComponentUpgraded = true;
    });
    if (!wasComponentUpgraded) {
        /* eslint-disable-next-line no-console */
        console.error(
            `Unexpected tag name "${sel}". This name is a registered custom element, preventing LWC to upgrade the element.`
        );
    }
    return element;
}
