/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import featureFlags from '@lwc/features';
import {
    ArrayIndexOf,
    ArrayPush,
    ArraySlice,
    ArraySplice,
    create,
    defineProperty,
    forEach,
    isFalse,
    isFunction,
    isTrue,
    isUndefined,
    toString,
} from '@lwc/shared';
import {
    eventToShadowRootMap,
    getHost,
    getShadowRoot,
    SyntheticShadowRootInterface,
} from './shadow-root';
import { eventCurrentTargetGetter, eventTargetGetter } from '../env/dom';
import { addEventListener, removeEventListener } from '../env/event-target';
import { compareDocumentPosition, DOCUMENT_POSITION_CONTAINED_BY } from '../env/node';
import { isInstanceOfNativeShadowRoot } from '../env/shadow-root';
import { shouldInvokeListener } from '../shared/event-target';

export const enum EventListenerContext {
    CUSTOM_ELEMENT_LISTENER,
    SHADOW_ROOT_LISTENER,
    UNKNOWN_LISTENER,
}

export const eventToContextMap: WeakMap<Event, EventListenerContext> = new WeakMap();

interface WrappedListener extends EventListener {
    placement: EventListenerContext;
    original: EventListener;
}

function isChildNode(root: Element, node: Node): boolean {
    return !!(compareDocumentPosition.call(root, node) & DOCUMENT_POSITION_CONTAINED_BY);
}

const GET_ROOT_NODE_CONFIG_FALSE = { composed: false };

function getRootNodeHost(node: Node, options: GetRootNodeOptions): Node {
    let rootNode: Node = node.getRootNode(options);

    // is SyntheticShadowRootInterface
    if ('mode' in rootNode && 'delegatesFocus' in rootNode) {
        rootNode = getHost(rootNode as SyntheticShadowRootInterface);
    }

    return rootNode;
}

interface ListenerMap {
    [key: string]: WrappedListener[];
}

const customElementToWrappedListeners: WeakMap<EventTarget, ListenerMap> = new WeakMap();

function getEventMap(elm: EventTarget): ListenerMap {
    let listenerInfo = customElementToWrappedListeners.get(elm);
    if (isUndefined(listenerInfo)) {
        listenerInfo = create(null) as ListenerMap;
        customElementToWrappedListeners.set(elm, listenerInfo);
    }
    return listenerInfo;
}

/**
 * Events dispatched on shadow roots actually end up being dispatched on their hosts. This means that the event.target
 * property of events dispatched on shadow roots always resolve to their host. This function understands this
 * abstraction and properly returns a reference to the shadow root when appropriate.
 */
export function getActualTarget(event: Event): EventTarget {
    return eventToShadowRootMap.get(event) ?? eventTargetGetter.call(event);
}

const shadowRootEventListenerMap: WeakMap<EventListener, WrappedListener> = new WeakMap();

function getWrappedShadowRootListener(listener: EventListener): WrappedListener {
    if (!isFunction(listener)) {
        throw new TypeError(); // avoiding problems with non-valid listeners
    }
    let shadowRootWrappedListener = shadowRootEventListenerMap.get(listener);
    if (isUndefined(shadowRootWrappedListener)) {
        shadowRootWrappedListener = function (event: Event) {
            // currentTarget is always defined inside an event listener
            let currentTarget = eventCurrentTargetGetter.call(event)!;
            // If currentTarget is not an instance of a native shadow root then we're dealing with a
            // host element whose synthetic shadow root must be accessed via getShadowRoot().
            if (!isInstanceOfNativeShadowRoot(currentTarget)) {
                currentTarget = getShadowRoot(currentTarget as Element);
            }

            let shouldInvoke;
            if (featureFlags.ENABLE_NON_COMPOSED_EVENTS_LEAKAGE) {
                shouldInvoke = shouldInvokeShadowRootListener(event);
            } else {
                const actualTarget = getActualTarget(event);
                shouldInvoke = shouldInvokeListener(event, actualTarget, currentTarget);
            }

            if (shouldInvoke) {
                listener.call(currentTarget, event);
            }
        } as WrappedListener;
        shadowRootWrappedListener.placement = EventListenerContext.SHADOW_ROOT_LISTENER;
        shadowRootEventListenerMap.set(listener, shadowRootWrappedListener);
    }
    return shadowRootWrappedListener;
}

const customElementEventListenerMap: WeakMap<EventListener, WrappedListener> = new WeakMap();

function getWrappedCustomElementListener(listener: EventListener): WrappedListener {
    if (!isFunction(listener)) {
        throw new TypeError(); // avoiding problems with non-valid listeners
    }
    let customElementWrappedListener = customElementEventListenerMap.get(listener);
    if (isUndefined(customElementWrappedListener)) {
        customElementWrappedListener = function (event: Event) {
            // currentTarget is always defined inside an event listener
            const currentTarget = eventCurrentTargetGetter.call(event)!;

            let shouldInvoke;
            if (featureFlags.ENABLE_NON_COMPOSED_EVENTS_LEAKAGE) {
                shouldInvoke = shouldInvokeCustomElementListener(event);
            } else {
                const actualTarget = getActualTarget(event);
                shouldInvoke = shouldInvokeListener(event, actualTarget, currentTarget);
            }

            if (shouldInvoke) {
                listener.call(currentTarget, event);
            }
        } as WrappedListener;
        customElementWrappedListener.placement = EventListenerContext.CUSTOM_ELEMENT_LISTENER;
        customElementEventListenerMap.set(listener, customElementWrappedListener);
    }
    return customElementWrappedListener;
}

function domListener(evt: Event) {
    let immediatePropagationStopped = false;
    let propagationStopped = false;
    const { type, stopImmediatePropagation, stopPropagation } = evt;
    // currentTarget is always defined
    const currentTarget = eventCurrentTargetGetter.call(evt)!;
    const listenerMap = getEventMap(currentTarget);
    const listeners = listenerMap![type]; // it must have listeners at this point
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
    eventToContextMap.set(evt, EventListenerContext.UNKNOWN_LISTENER);
}

function attachDOMListener(elm: Element, type: string, wrappedListener: WrappedListener) {
    const listenerMap = getEventMap(elm);
    let cmpEventHandlers = listenerMap[type];
    if (isUndefined(cmpEventHandlers)) {
        cmpEventHandlers = listenerMap[type] = [];
    }
    // Prevent identical listeners from subscribing to the same event type.
    // TODO [#1824]: Options will also play a factor when we introduce support for them (#1824).
    if (ArrayIndexOf.call(cmpEventHandlers, wrappedListener) !== -1) {
        return;
    }
    // only add to DOM if there is no other listener on the same placement yet
    if (cmpEventHandlers.length === 0) {
        // super.addEventListener() - this will not work on
        addEventListener.call(elm, type, domListener);
    }
    ArrayPush.call(cmpEventHandlers, wrappedListener);
}

function detachDOMListener(elm: Element, type: string, wrappedListener: WrappedListener) {
    const listenerMap = getEventMap(elm);
    let p: number;
    let listeners: EventListener[] | undefined;
    if (
        !isUndefined((listeners = listenerMap[type])) &&
        (p = ArrayIndexOf.call(listeners, wrappedListener)) !== -1
    ) {
        ArraySplice.call(listeners, p, 1);
        // only remove from DOM if there is no other listener on the same placement
        if (listeners.length === 0) {
            removeEventListener.call(elm, type, domListener);
        }
    }
}

function shouldInvokeCustomElementListener(event: Event): boolean {
    const { composed } = event;

    if (isTrue(composed)) {
        // Listeners on host elements should always be invoked for {composed: true} events.
        return true;
    }

    // If this {composed: false} event was dispatched on any root.
    if (eventToShadowRootMap.has(event)) {
        return false;
    }

    const target = eventTargetGetter.call(event);
    const currentTarget = eventCurrentTargetGetter.call(event);

    // If this {composed: false} event was dispatched on the current target host.
    if (target === currentTarget) {
        return true;
    }

    // At this point the event must be {bubbles: true, composed: false} and was dispatched from a
    // shadow-excluding descendant node. In this case, we only invoke the listener if the target
    // host was assigned to a slot in the composed subtree of the current target host.
    const targetHost = getRootNodeHost(target as Node, GET_ROOT_NODE_CONFIG_FALSE) as HTMLElement;
    const currentTargetHost = currentTarget as HTMLElement;
    return isChildNode(targetHost, currentTargetHost);
}

function shouldInvokeShadowRootListener(event: Event): boolean {
    const { composed } = event;
    const target = eventTargetGetter.call(event);
    const currentTarget = eventCurrentTargetGetter.call(event);

    // If the event was dispatched on the host or its root.
    if (target === currentTarget) {
        // Invoke the listener if the event was dispatched directly on the root.
        return eventToShadowRootMap.get(event) === getShadowRoot(target as Element);
    }

    // At this point the event is {bubbles: true} and was dispatched from a shadow-including descendant node.
    if (isTrue(composed)) {
        // Invoke the listener if the event is {composed: true}.
        return true;
    }

    // At this point the event must be {bubbles: true, composed: false}.
    if (isTrue(eventToShadowRootMap.has(event))) {
        // Don't invoke the listener because the event was dispatched on a descendant root.
        return false;
    }

    const targetHost = getRootNodeHost(target as Node, GET_ROOT_NODE_CONFIG_FALSE) as HTMLElement;
    const currentTargetHost = currentTarget as HTMLElement;
    const isCurrentTargetSlotted = isChildNode(targetHost, currentTargetHost);

    // At this point the event must be {bubbles: true, composed: false} and was dispatched from a
    // shadow-excluding descendant node. In this case, we only invoke the listener if the target
    // host was assigned to a slot in the composed subtree of the current target host, or the
    // descendant node is in the shadow tree of the current root.
    return isCurrentTargetSlotted || targetHost === currentTargetHost;
}

export function addCustomElementEventListener(
    this: Element,
    type: string,
    listener: EventListenerOrEventListenerObject,
    _options?: boolean | AddEventListenerOptions
) {
    if (process.env.NODE_ENV !== 'production') {
        if (!isFunction(listener)) {
            throw new TypeError(
                `Invalid second argument for Element.addEventListener() in ${toString(
                    this
                )} for event "${type}". Expected an EventListener but received ${listener}.`
            );
        }
    }
    // TODO [#1824]: Lift this restriction on the option parameter
    if (isFunction(listener)) {
        const wrappedListener = getWrappedCustomElementListener(listener);
        attachDOMListener(this, type, wrappedListener);
    }
}

export function removeCustomElementEventListener(
    this: Element,
    type: string,
    listener: EventListenerOrEventListenerObject,
    _options?: boolean | AddEventListenerOptions
) {
    // TODO [#1824]: Lift this restriction on the option parameter
    if (isFunction(listener)) {
        const wrappedListener = getWrappedCustomElementListener(listener);
        detachDOMListener(this, type, wrappedListener);
    }
}

export function addShadowRootEventListener(
    sr: SyntheticShadowRootInterface,
    type: string,
    listener: EventListenerOrEventListenerObject,
    _options?: boolean | AddEventListenerOptions
) {
    if (process.env.NODE_ENV !== 'production') {
        if (!isFunction(listener)) {
            throw new TypeError(
                `Invalid second argument for ShadowRoot.addEventListener() in ${toString(
                    sr
                )} for event "${type}". Expected an EventListener but received ${listener}.`
            );
        }
    }
    // TODO [#1824]: Lift this restriction on the option parameter
    if (isFunction(listener)) {
        const elm = getHost(sr);
        const wrappedListener = getWrappedShadowRootListener(listener);
        attachDOMListener(elm, type, wrappedListener);
    }
}

export function removeShadowRootEventListener(
    sr: SyntheticShadowRootInterface,
    type: string,
    listener: EventListenerOrEventListenerObject,
    _options?: boolean | AddEventListenerOptions
) {
    // TODO [#1824]: Lift this restriction on the option parameter
    if (isFunction(listener)) {
        const elm = getHost(sr);
        const wrappedListener = getWrappedShadowRootListener(listener);
        detachDOMListener(elm, type, wrappedListener);
    }
}
