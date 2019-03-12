/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from '../shared/assert';
import {
    isUndefined,
    assign,
    isNull,
    isObject,
    isTrue,
    isFalse,
    toString,
} from '../shared/language';
import {
    createVM,
    removeRootVM,
    appendRootVM,
    getCustomElementVM,
    getNodeKey,
    VMState,
} from './vm';
import { ComponentConstructor } from './component';
import { EmptyObject } from './utils';
import { setInternalField, getInternalField, createFieldName } from '../shared/fields';
import { isNativeShadowRootAvailable } from '../env/dom';
import { patchCustomElementProto } from './patch';
import { isComponentConstructor, getComponentDef, setElementProto } from './def';
import { patchCustomElementWithRestrictions } from './restrictions';
import { GlobalMeasurementPhase, startGlobalMeasure, endGlobalMeasure } from './performance-timing';
import { appendChild, insertBefore, replaceChild, removeChild } from '../env/node';

const ConnectingSlot = createFieldName('connecting');
const DisconnectingSlot = createFieldName('disconnecting');

function callNodeSlot(node: Node, slot: symbol): Node {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(node, `callNodeSlot() should not be called for a non-object`);
    }
    const fn = getInternalField(node, slot);
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
    fallback?: boolean;
    mode?: ShadowDomMode;
}

/**
 * This method is almost identical to document.createElement
 * (https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement)
 * with the slightly difference that in the options, you can pass the `is`
 * property set to a Constructor instead of just a string value. E.g.:
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

    const Ctor = options.is;
    if (!isComponentConstructor(Ctor)) {
        throw new TypeError(
            `${Ctor} is not a valid component constructor, or does not extends LightningElement from "lwc". You probably forgot to add the extend clause on the class declaration.`
        );
    }

    const mode = options.mode !== 'closed' ? 'open' : 'closed';
    const fallback =
        isUndefined(options.fallback) ||
        isTrue(options.fallback) ||
        isFalse(isNativeShadowRootAvailable);

    // Create element with correct tagName
    const element = document.createElement(sel);
    if (!isUndefined(getNodeKey(element))) {
        // There is a possibility that a custom element is registered under tagName,
        // in which case, the initialization is already carry on, and there is nothing else
        // to do here.
        return element;
    }

    const def = getComponentDef(Ctor);
    setElementProto(element, def);
    if (isTrue(fallback)) {
        patchCustomElementProto(element, {
            def,
        });
    }
    if (process.env.NODE_ENV !== 'production') {
        patchCustomElementWithRestrictions(element, EmptyObject);
    }
    // In case the element is not initialized already, we need to carry on the manual creation
    createVM(sel, element, Ctor, { mode, fallback, isRoot: true, owner: null });
    // Handle insertion and removal from the DOM manually
    setInternalField(element, ConnectingSlot, () => {
        const vm = getCustomElementVM(element);
        startGlobalMeasure(GlobalMeasurementPhase.HYDRATE, vm);
        if (vm.state === VMState.connected) {
            // usually means moving the element from one place to another, which is observable via life-cycle hooks
            removeRootVM(vm);
        }
        appendRootVM(vm);
        endGlobalMeasure(GlobalMeasurementPhase.HYDRATE, vm);
    });
    setInternalField(element, DisconnectingSlot, () => {
        const vm = getCustomElementVM(element);
        removeRootVM(vm);
    });
    return element;
}
