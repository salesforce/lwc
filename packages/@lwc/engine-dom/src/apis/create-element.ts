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
    StringToLowerCase,
} from '@lwc/shared';
import {
    createVM,
    connectRootElement,
    disconnectRootElement,
    LightningElement,
    shouldBeFormAssociated,
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

let monkeyPatched = false;

function monkeyPatchDomAPIs() {
    if (monkeyPatched) {
        // don't double-patch
        return;
    }
    monkeyPatched = true;
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

if (process.env.NODE_ENV !== 'production') {
    // In dev mode, we must eagerly patch these DOM APIs because `restrictions.ts` in `@lwc/engine-core` does
    // its own monkey-patching, and the assumption is that its monkey patches will apply on top of our own.
    // If we _don't_ eagerly monkey-patch, then APIs like `element.appendChild` could end up calling through
    // directly to the native DOM APIs instead, which would bypass synthetic custom element lifecycle
    // and cause rendering/`connectedCallback`/`disconnectedCallback` not to fire.
    // In prod mode, we avoid global patching as a slight perf optimization and because it's good practice
    // in general to avoid global patching.
    // See issue #4242 for details.
    monkeyPatchDomAPIs();
}

/**
 * Properties defined on the component class, excluding those inherited from `LightningElement`.
 */
// TODO [#4292]: Restrict this to only @api props
type ComponentClassProperties<T> = Omit<T, keyof LightningElement>;

/**
 * The custom element returned when calling {@linkcode createElement} with the given component
 * constructor.
 *
 * NOTE: The returned type incorrectly includes _all_ properties defined on the component class,
 * even though the runtime object only uses those decorated with `@api`. This is due to a
 * limitation of TypeScript. To avoid inferring incorrect properties, provide an explicit generic
 * parameter, e.g. `createElement<typeof LightningElement>('x-foo', { is: FooCtor })`.
 *
 * @example ```
 * class Example extends LightningElement {
 *   @api exposed = 'hello'
 *   internal = 'secret'
 * }
 * const example = createElement('c-example', { is: Example })
 * // TypeScript thinks that `example.internal` is a string, when it's actually undefined.
 * const exposed = example.exposed // type is 'string'
 * console.log(exposed) // prints 'hello'
 * const internal = example.internal // type is 'string'
 * console.log(internal) // prints `undefined`
 * ```
 */
export type LightningHTMLElement<T> = HTMLElement & ComponentClassProperties<T>;

/**
 * EXPERIMENTAL: This function is almost identical to document.createElement with the slightly
 * difference that in the options, you can pass the `is` property set to a Constructor instead of
 * just a string value. The intent is to allow the creation of an element controlled by LWC without
 * having to register the element as a custom element.
 *
 * NOTE: The returned type incorrectly includes _all_ properties defined on the component class,
 * even though the runtime object only uses those decorated with `@api`. This is due to a
 * limitation of TypeScript. To avoid inferring incorrect properties, provide an explicit generic
 * parameter, e.g. `createElement<typeof LightningElement>('x-foo', { is: FooCtor })`.
 * @param sel The tagname of the element to create
 * @param options Control the behavior of the created element
 * @param options.is The LWC component that the element should be
 * @param options.mode What kind of shadow root to use
 * @returns The created HTML element
 * @throws Throws when called with invalid parameters.
 * @example
 * const el = createElement('x-foo', { is: FooCtor });
 */
export function createElement<Component>(
    sel: string,
    options: {
        // Because the `LightningHTMLElement` type is flawed and includes more props than actually
        // exist, we want to enable customers to provide an explicit generic parameter containing
        // only the props from the component they want to expose. For example we want to allow this:
        // class Foo extends LightningElement { @api exposed = 'public'; hidden = 'secret'; }
        // createElement<{exposed: string}>('x-foo', { is: Foo })
        is: LightningElement['constructor'] & { new (): Component };
        mode?: 'open' | 'closed';
    }
): LightningHTMLElement<Component> {
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

    const { createCustomElement } = renderer;

    // tagName must be all lowercase, unfortunately, we have legacy code that is
    // passing `sel` as a camel-case, which makes them invalid custom elements name
    // the following line guarantees that this does not leaks beyond this point.
    const tagName = StringToLowerCase.call(sel);

    const useNativeCustomElementLifecycle =
        !lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE;

    const isFormAssociated = shouldBeFormAssociated(Ctor);

    // the custom element from the registry is expecting an upgrade callback
    /*
     * Note: if the upgradable constructor does not expect, or throw when we new it
     * with a callback as the first argument, we could implement a more advanced
     * mechanism that only passes that argument if the constructor is known to be
     * an upgradable custom element.
     */
    const upgradeCallback = (elm: HTMLElement) => {
        createVM(elm, Ctor, renderer, {
            tagName,
            mode: options.mode !== 'closed' ? 'open' : 'closed',
            owner: null,
        });
        if (!useNativeCustomElementLifecycle) {
            // Monkey-patch on-demand, because `lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE` may be set to
            // `true` lazily, after `@lwc/engine-dom` has finished initializing but before a component has rendered.
            monkeyPatchDomAPIs();
            ConnectingSlot.set(elm, connectRootElement);
            DisconnectingSlot.set(elm, disconnectRootElement);
        }
    };

    return createCustomElement(
        tagName,
        upgradeCallback,
        useNativeCustomElementLifecycle,
        isFormAssociated
    );
}
