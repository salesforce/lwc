/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
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
import { shouldInvokeListener } from '../shared/event-target';

export enum EventListenerContext {
    CUSTOM_ELEMENT_LISTENER,
    SHADOW_ROOT_LISTENER,
    UNKNOWN_LISTENER,
}

export const eventToContextMap: WeakMap<Event, EventListenerContext> = new WeakMap();

interface WrappedListener extends EventListener {
    placement: EventListenerContext;
    original: EventListener;
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
 * This function exists because events dispatched on shadow roots are actually dispatched on their
 * hosts and listeners added to shadow roots are actually added to their hosts.
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
            const hostElement = eventCurrentTargetGetter.call(event) as HTMLElement;
            const actualCurrentTarget = getShadowRoot(hostElement);
            const actualTarget = getActualTarget(event);

            if (shouldInvokeListener(event, actualTarget, actualCurrentTarget)) {
                listener.call(actualCurrentTarget, event);
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
            const currentTarget = eventCurrentTargetGetter.call(event) as EventTarget;
            const actualTarget = getActualTarget(event);

            if (shouldInvokeListener(event, actualTarget, currentTarget)) {
                // all handlers on the custom element should be called with undefined 'this'
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
