import assert from "../shared/assert";
import {
    addEventListener,
    removeEventListener,
} from "../env/element";
import {
    compareDocumentPosition,
    DOCUMENT_POSITION_CONTAINED_BY,
    DOCUMENT_FRAGMENT_NODE,
} from "../env/node";
import { ArraySlice, ArraySplice, ArrayIndexOf, create, ArrayPush, isUndefined, isFunction, defineProperties, toString, forEach, defineProperty, isFalse } from "../shared/language";
import { getRootNodeGetter } from "./traverse";
import { getHost, SyntheticShadowRootInterface, SyntheticShadowRoot, getShadowRoot } from "./shadow-root";
import { eventCurrentTargetGetter, eventTargetGetter } from "../env/dom";

interface WrappedListener extends EventListener {
    placement: EventListenerContext;
    original: EventListener;
}

enum EventListenerContext {
    CUSTOM_ELEMENT_LISTENER = 1,
    SHADOW_ROOT_LISTENER = 2,
}

const eventToContextMap: WeakMap<Event, EventListenerContext> = new WeakMap();

function isChildNode(root: Element, node: Node): boolean {
    return !!(compareDocumentPosition.call(root, node) & DOCUMENT_POSITION_CONTAINED_BY);
}

const GET_ROOT_NODE_CONFIG_FALSE = { composed: false };

function getRootNodeHost(node: Node, options): Node {
    let rootNode = getRootNodeGetter.call(node, options);

    // is SyntheticShadowRootInterface
    if ('mode' in rootNode && 'delegatesFocus' in rootNode) {
        rootNode = getHost(rootNode);
    }

    return rootNode;
}

const EventPatchDescriptors: PropertyDescriptorMap = {
    target: {
        get(this: Event): EventTarget {
            const originalCurrentTarget: EventTarget = eventCurrentTargetGetter.call(this);
            const originalTarget: EventTarget = eventTargetGetter.call(this);
            const eventContext = eventToContextMap.get(this);
            const currentTarget = (eventContext === EventListenerContext.SHADOW_ROOT_LISTENER) ?
                getShadowRoot(originalCurrentTarget as HTMLElement) :
                originalCurrentTarget;
            return retarget(currentTarget as Node, pathComposer(originalTarget as Node, this.composed)) as EventTarget;
        },
        enumerable: true,
        configurable: true,
    },
};

export function patchEvent(event: Event) {
    if (!eventToContextMap.has(event)) {
        defineProperties(event, EventPatchDescriptors);
        eventToContextMap.set(event, 0);
    }
}

interface ListenerMap {
    [key: string]: WrappedListener[];
}

const customElementToWrappedListeners: WeakMap<HTMLElement, ListenerMap> = new WeakMap();

function getEventMap(elm: HTMLElement): ListenerMap {
    let listenerInfo = customElementToWrappedListeners.get(elm);
    if (isUndefined(listenerInfo)) {
        listenerInfo = create(null) as ListenerMap;
        customElementToWrappedListeners.set(elm, listenerInfo);
    }
    return listenerInfo;
}

const shadowRootEventListenerMap: WeakMap<EventListener, WrappedListener> = new WeakMap();

function getWrappedShadowRootListener(sr: SyntheticShadowRootInterface, listener: EventListener): WrappedListener {
    if (!isFunction(listener)) {
        throw new TypeError(); // avoiding problems with non-valid listeners
    }
    let shadowRootWrappedListener = shadowRootEventListenerMap.get(listener);
    if (isUndefined(shadowRootWrappedListener)) {
        shadowRootWrappedListener = function(event: Event) {
            // * if the event is dispatched directly on the host, it is not observable from root
            // * if the event is dispatched in an element that does not belongs to the shadow and it is not composed,
            //   it is not observable from the root
            const { composed } = event as any;
            const target = eventTargetGetter.call(event);
            const currentTarget = eventCurrentTargetGetter.call(event);
            if (target !== currentTarget) {
                const rootNode = getRootNodeHost(target, { composed });

                if (isChildNode(rootNode as HTMLElement, currentTarget as Node) ||
                    (composed === false && rootNode === currentTarget)) {
                    // TODO: we should figure why `undefined` makes sense here
                    // and how this is going to work for native shadow root?
                    listener.call(sr, event);
                }
            }
        } as WrappedListener;
        shadowRootWrappedListener!.placement = EventListenerContext.SHADOW_ROOT_LISTENER;
        if (process.env.NODE_ENV !== 'production') {
            shadowRootWrappedListener!.original = listener; // for logging purposes
        }
        shadowRootEventListenerMap.set(listener, shadowRootWrappedListener);
    }
    return shadowRootWrappedListener;
}

const customElementEventListenerMap: WeakMap<EventListener, WrappedListener> = new WeakMap();

function getWrappedCustomElementListener(elm: HTMLElement, listener: EventListener): WrappedListener {
    if (!isFunction(listener)) {
        throw new TypeError(); // avoiding problems with non-valid listeners
    }
    let customElementWrappedListener = customElementEventListenerMap.get(listener);
    if (isUndefined(customElementWrappedListener)) {
        customElementWrappedListener = function(event: Event) {
            if (isValidEventForCustomElement(event)) {
                // all handlers on the custom element should be called with undefined 'this'
                listener.call(elm, event);
            }
        } as WrappedListener;
        customElementWrappedListener!.placement = EventListenerContext.CUSTOM_ELEMENT_LISTENER;
        if (process.env.NODE_ENV !== 'production') {
            customElementWrappedListener!.original = listener; // for logging purposes
        }
        customElementEventListenerMap.set(listener, customElementWrappedListener);
    }
    return customElementWrappedListener;
}

function domListener(evt: Event) {
    let immediatePropagationStopped = false;
    let propagationStopped = false;
    const { type, stopImmediatePropagation, stopPropagation } = evt;
    const currentTarget = eventCurrentTargetGetter.call(evt);
    const listenerMap = getEventMap(currentTarget);
    const listeners = listenerMap![type] as WrappedListener[]; // it must have listeners at this point
    defineProperty(evt, 'stopImmediatePropagation', {
        value() {
            immediatePropagationStopped = true;
            stopImmediatePropagation.call(evt);
        },
        writable: true,
        enumerable: true,
        configurable: true,
    });
    defineProperty(evt, 'stopPropagation', {
        value() {
            propagationStopped = true;
            stopPropagation.call(evt);
        },
        writable: true,
        enumerable: true,
        configurable: true,
    });
    patchEvent(evt);
    // in case a listener adds or removes other listeners during invocation
    const bookkeeping: WrappedListener[] = ArraySlice.call(listeners);

    function invokeListenersByPlacement(placement: EventListenerContext) {
        forEach.call(bookkeeping, (listener: WrappedListener) => {
            if (isFalse(immediatePropagationStopped) && listener.placement === placement) {
                // making sure that the listener was not removed from the original listener queue
                if (ArrayIndexOf.call(listeners, listener) !== -1) {
                    // all handlers on the custom element should be called with undefined 'this'
                    listener.call(undefined, evt);
                }
            }
        });
    }

    eventToContextMap.set(evt, EventListenerContext.SHADOW_ROOT_LISTENER);
    invokeListenersByPlacement(EventListenerContext.SHADOW_ROOT_LISTENER);
    if (isFalse(immediatePropagationStopped) && isFalse(propagationStopped)) {
        // doing the second iteration only if the first one didn't interrupt the event propagation
        eventToContextMap.set(evt, EventListenerContext.CUSTOM_ELEMENT_LISTENER);
        invokeListenersByPlacement(EventListenerContext.CUSTOM_ELEMENT_LISTENER);
    }
    eventToContextMap.set(evt, 0);
}

function attachDOMListener(elm: HTMLElement, type: string, wrappedListener: WrappedListener) {
    const listenerMap = getEventMap(elm);
    let cmpEventHandlers = listenerMap[type];
    if (isUndefined(cmpEventHandlers)) {
        cmpEventHandlers = listenerMap[type] = [];
    }
    // only add to DOM if there is no other listener on the same placement yet
    if (cmpEventHandlers.length === 0) {
        addEventListener.call(elm, type, domListener);
    } else if (process.env.NODE_ENV !== 'production') {
        if (ArrayIndexOf.call(cmpEventHandlers, wrappedListener) !== -1) {
            assert.logWarning(`${toString(elm)} has duplicate listener for event "${type}". Instead add the event listener in the connectedCallback() hook.`, elm);
        }
    }
    ArrayPush.call(cmpEventHandlers, wrappedListener);
}

function detachDOMListener(elm: HTMLElement, type: string, wrappedListener: WrappedListener) {
    const listenerMap = getEventMap(elm);
    let p: number;
    let listeners: EventListener[] | undefined;
    if (!isUndefined(listeners = listenerMap[type]) && (p = ArrayIndexOf.call(listeners, wrappedListener)) !== -1) {
        ArraySplice.call(listeners, p, 1);
        // only remove from DOM if there is no other listener on the same placement
        if (listeners!.length === 0) {
            removeEventListener.call(elm, type, domListener);
        }
    } else if (process.env.NODE_ENV !== 'production') {
        assert.logError(
            `Did not find event listener for event "${type}" executing removeEventListener on ${toString(elm)}. This is probably a typo or a life cycle mismatch. Make sure that you add the right event listeners in the connectedCallback() hook and remove them in the disconnectedCallback() hook.`,
            elm
        );
    }
}

function isValidEventForCustomElement(event: Event): boolean {
    const target = eventTargetGetter.call(event);
    const currentTarget = eventCurrentTargetGetter.call(event);
    const { composed } = event as any;
    return (
        // it is composed, and we should always get it, or
        composed === true ||
        // it is dispatched onto the custom element directly, or
        target === currentTarget ||
        // it is coming from a slotted element
        isChildNode(getRootNodeHost(target, GET_ROOT_NODE_CONFIG_FALSE) as HTMLElement, currentTarget as Node)
    );
}

export function addCustomElementEventListener(elm: HTMLElement, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isFunction(listener), `Invalid second argument for this.template.addEventListener() in ${toString(elm)} for event "${type}". Expected an EventListener but received ${listener}.`);
        // TODO: issue #420
        // this is triggered when the component author attempts to add a listener programmatically into a lighting element node
        if (!isUndefined(options)) {
            assert.logWarning(
                `The 'addEventListener' method in 'LightningElement' does not support more than 2 arguments. Options to make the listener passive, once, or capture are not allowed but received: ${toString(options)}`,
                elm
            );
        }
    }
    const wrappedListener = getWrappedCustomElementListener(elm, listener);
    attachDOMListener(elm, type, wrappedListener);
}

export function removeCustomElementEventListener(elm: HTMLElement, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
    const wrappedListener = getWrappedCustomElementListener(elm, listener);
    detachDOMListener(elm, type, wrappedListener);
}

export function addShadowRootEventListener(sr: SyntheticShadowRootInterface, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isFunction(listener), `Invalid second argument for this.template.addEventListener() in ${toString(sr)} for event "${type}". Expected an EventListener but received ${listener}.`);
        // TODO: issue #420
        // this is triggered when the component author attempts to add a listener programmatically into its Component's shadow root
        if (!isUndefined(options)) {
            assert.logWarning(
                `The 'addEventListener' method in 'ShadowRoot' does not support more than 2 arguments. Options to make the listener passive, once, or capture are not allowed but received: ${toString(options)}`,
                getHost(sr)
            );
        }
    }
    const elm = getHost(sr);
    const wrappedListener = getWrappedShadowRootListener(sr, listener);
    attachDOMListener(elm, type, wrappedListener);
}

export function removeShadowRootEventListener(sr: SyntheticShadowRootInterface, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
    const elm = getHost(sr);
    const wrappedListener = getWrappedShadowRootListener(sr, listener);
    detachDOMListener(elm, type, wrappedListener);
}

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
function pathComposer(startNode: Node, composed: boolean): Node[] {
    const composedPath: HTMLElement[] = [];
    let current = startNode;
    const startRoot = startNode as any === window ? window : getRootNodeGetter.call(startNode);
    while (current) {
        composedPath.push(current as HTMLElement);
        if ((current as HTMLElement).assignedSlot) {
            current = (current as HTMLElement).assignedSlot as HTMLSlotElement;
        } else if ((current as HTMLElement).nodeType === DOCUMENT_FRAGMENT_NODE && (current as ShadowRoot).host && (composed || current !== startRoot)) {
            current = (current as ShadowRoot).host as HTMLElement;
        } else {
            current = (current as HTMLElement).parentNode as any;
        }
    }
    // event composedPath includes window when startNode's ownerRoot is document
    if (composedPath[composedPath.length - 1] as any === document) {
        composedPath.push(window as any);
    }
    return composedPath;
}

function retarget(refNode: Node, path: Node[]): EventTarget | undefined {
    // If ANCESTOR's root is not a shadow root or ANCESTOR's root is BASE's
    // shadow-including inclusive ancestor, return ANCESTOR.
    const refNodePath = pathComposer(refNode, true);
    const p$ = path;
    for (let i = 0, ancestor, lastRoot, root, rootIdx; i < p$.length; i++) {
        ancestor = p$[i];
        root = ancestor === window ? window : getRootNodeGetter.call(ancestor);
        if (root !== lastRoot) {
            rootIdx = refNodePath.indexOf(root);
            lastRoot = root;
        }
        if (!(root instanceof SyntheticShadowRoot) || rootIdx > -1) {
            return ancestor;
        }
    }
}
