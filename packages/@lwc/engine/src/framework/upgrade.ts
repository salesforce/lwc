/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    assert,
    assign,
    isFunction,
    isNull,
    isObject,
    isUndefined,
    toString,
    HiddenField,
    createHiddenField,
    getHiddenField,
    setHiddenField,
} from '@lwc/shared';
import { createVM, removeRootVM, appendRootVM, getAssociatedVMIfPresent } from './vm';
import { ComponentConstructor } from './component';
import { getComponentDef, setElementProto } from './def';
import { appendChild, insertBefore, replaceChild, removeChild } from '../env/node';

type NodeSlot = () => {};

const ConnectingSlot = createHiddenField<NodeSlot>('connecting', 'engine');
const DisconnectingSlot = createHiddenField<NodeSlot>('disconnecting', 'engine');

function callNodeSlot(node: Node, slot: HiddenField<NodeSlot>): Node {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(node, `callNodeSlot() should not be called for a non-object`);
    }

    const fn = getHiddenField(node, slot);

    if (!isUndefined(fn)) {
        fn();
    }
    return node; // for convenience
}

// Monkey patching Node methods to be able to detect the insertions and removal of root elements
// created via createElement.
assign(Node.prototype, {
    appendChild(newChild: Node): Node {
        const appendedNode = appendChild.call(this, newChild);
        return callNodeSlot(appendedNode, ConnectingSlot);
    },
    insertBefore(newChild: Node, referenceNode: Node): Node {
        const insertedNode = insertBefore.call(this, newChild, referenceNode);
        return callNodeSlot(insertedNode, ConnectingSlot);
    },
    removeChild(oldChild: Node): Node {
        const removedNode = removeChild.call(this, oldChild);
        return callNodeSlot(removedNode, DisconnectingSlot);
    },
    replaceChild(newChild: Node, oldChild: Node): Node {
        const replacedNode = replaceChild.call(this, newChild, oldChild);
        callNodeSlot(replacedNode, DisconnectingSlot);
        callNodeSlot(newChild, ConnectingSlot);
        return replacedNode;
    },
});

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
        is: ComponentConstructor;
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
            `"createElement" function expects a "is" option with a valid component constructor.`
        );
    }

    const element = document.createElement(sel);

    // There is a possibility that a custom element is registered under tagName, in which case, the
    // initialization is already carry on, and there is nothing else to do here.
    if (!isUndefined(getAssociatedVMIfPresent(element))) {
        return element;
    }

    const def = getComponentDef(Ctor);
    setElementProto(element, def);

    const vm = createVM(element, def.ctor, {
        mode: options.mode !== 'closed' ? 'open' : 'closed',
        isRoot: true,
        owner: null,
    });

    setHiddenField(element, ConnectingSlot, () => appendRootVM(vm));
    setHiddenField(element, DisconnectingSlot, () => removeRootVM(vm));

    return element;
}
