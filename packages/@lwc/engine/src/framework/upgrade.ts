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
import {
    createVM,
    removeRootVM,
    appendRootVM,
    getAssociatedVM,
    VMState,
    getAssociatedVMIfPresent,
} from './vm';
import { ComponentConstructor } from './component';
import { EmptyObject, isCircularModuleDependency, resolveCircularModuleDependency } from './utils';
import { getComponentInternalDef, setElementProto } from './def';
import { patchCustomElementWithRestrictions } from './restrictions';
import { GlobalMeasurementPhase, startGlobalMeasure, endGlobalMeasure } from './performance-timing';
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

// monkey patching Node methods to be able to detect the insertions and removal of
// root elements created via createElement.
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

type ShadowDomMode = 'open' | 'closed';

interface CreateElementOptions {
    is: ComponentConstructor;
    mode?: ShadowDomMode;
}

/**
 * EXPERIMENTAL: This function is almost identical to document.createElement
 * (https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement)
 * with the slightly difference that in the options, you can pass the `is`
 * property set to a Constructor instead of just a string value. The intent
 * is to allow the creation of an element controlled by LWC without having
 * to register the element as a custom element. E.g.:
 *
 * const el = createElement('x-foo', { is: FooCtor });
 *
 * If the value of `is` attribute is not a constructor,
 * then it throws a TypeError.
 */
export function createElement(sel: string, options: CreateElementOptions): HTMLElement {
    if (!isObject(options) || isNull(options)) {
        throw new TypeError(
            `"createElement" function expects an object as second parameter but received "${toString(
                options
            )}".`
        );
    }

    let Ctor = options.is;
    if (!isFunction(Ctor)) {
        throw new TypeError(
            `"createElement" function expects a "is" option with a valid component constructor.`
        );
    }

    const mode = options.mode !== 'closed' ? 'open' : 'closed';

    // Create element with correct tagName
    const element = document.createElement(sel);
    if (!isUndefined(getAssociatedVMIfPresent(element))) {
        // There is a possibility that a custom element is registered under tagName,
        // in which case, the initialization is already carry on, and there is nothing else
        // to do here.
        return element;
    }

    if (isCircularModuleDependency(Ctor)) {
        Ctor = resolveCircularModuleDependency(Ctor);
    }

    const def = getComponentInternalDef(Ctor);
    setElementProto(element, def);

    if (process.env.NODE_ENV !== 'production') {
        patchCustomElementWithRestrictions(element, EmptyObject);
    }
    // In case the element is not initialized already, we need to carry on the manual creation
    createVM(element, Ctor, { mode, isRoot: true, owner: null });
    // Handle insertion and removal from the DOM manually
    setHiddenField(element, ConnectingSlot, () => {
        const vm = getAssociatedVM(element);
        startGlobalMeasure(GlobalMeasurementPhase.HYDRATE, vm);
        if (vm.state === VMState.connected) {
            // usually means moving the element from one place to another, which is observable via life-cycle hooks
            removeRootVM(vm);
        }
        appendRootVM(vm);
        endGlobalMeasure(GlobalMeasurementPhase.HYDRATE, vm);
    });
    setHiddenField(element, DisconnectingSlot, () => {
        const vm = getAssociatedVM(element);
        removeRootVM(vm);
    });
    return element;
}
