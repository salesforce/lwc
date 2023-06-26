/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    ArrayFindIndex,
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

import { isInstanceOfNativeShadowRoot } from '../env/shadow-root';
import { eventCurrentTargetGetter, eventTargetGetter } from '../env/dom';
import { addEventListener, removeEventListener } from '../env/event-target';

import { shouldInvokeListener } from '../shared/event-target';

import { eventToShadowRootMap, getHost, getShadowRoot } from './shadow-root';

export const enum EventListenerContext {
    CUSTOM_ELEMENT_LISTENER,
    SHADOW_ROOT_LISTENER,
    UNKNOWN_LISTENER,
}

export const eventToContextMap: WeakMap<Event, EventListenerContext> = new WeakMap();

type ManagedListener = {
    handleEvent: EventListener;
    // Browsers use the listener reference or the listener object reference when deduping event
    // bindings so we also track those references to simulate native behavior.
    identity: EventListenerOrEventListenerObject;
    placement: EventListenerContext;
};

interface ListenerMap {
    [key: string]: ManagedListener[];
}

function getEventHandler(listener: EventListenerOrEventListenerObject): EventListener {
    if (isFunction(listener)) {
        return listener;
    } else {
        return listener.handleEvent;
    }
}

function isEventListenerOrEventListenerObject(
    listener: any
): listener is EventListenerOrEventListenerObject {
    return isFunction(listener) || isFunction(listener?.handleEvent);
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

const shadowRootEventListenerMap: WeakMap<EventListenerOrEventListenerObject, ManagedListener> =
    new WeakMap();

function getManagedShadowRootListener(
    listener: EventListenerOrEventListenerObject
): ManagedListener {
    if (!isEventListenerOrEventListenerObject(listener)) {
        throw new TypeError(); // avoiding problems with non-valid listeners
    }
    let managedListener = shadowRootEventListenerMap.get(listener);
    if (isUndefined(managedListener)) {
        managedListener = {
            identity: listener,
            placement: EventListenerContext.SHADOW_ROOT_LISTENER,
            handleEvent(event: Event) {
                // currentTarget is always defined inside an event listener
                let currentTarget = eventCurrentTargetGetter.call(event)!;
                // If currentTarget is not an instance of a native shadow root then we're dealing with a
                // host element whose synthetic shadow root must be accessed via getShadowRoot().
                if (!isInstanceOfNativeShadowRoot(currentTarget)) {
                    currentTarget = getShadowRoot(currentTarget as Element);
                }
                const actualTarget = getActualTarget(event);
                if (shouldInvokeListener(event, actualTarget, currentTarget)) {
                    getEventHandler(listener).call(currentTarget, event);
                }
            },
        };
        shadowRootEventListenerMap.set(listener, managedListener);
    }
    return managedListener;
}

const customElementEventListenerMap: WeakMap<EventListenerOrEventListenerObject, ManagedListener> =
    new WeakMap();

function getManagedCustomElementListener(
    listener: EventListenerOrEventListenerObject
): ManagedListener {
    if (!isEventListenerOrEventListenerObject(listener)) {
        throw new TypeError(); // avoiding problems with non-valid listeners
    }
    let managedListener = customElementEventListenerMap.get(listener);
    if (isUndefined(managedListener)) {
        managedListener = {
            identity: listener,
            placement: EventListenerContext.CUSTOM_ELEMENT_LISTENER,
            handleEvent(event: Event) {
                // currentTarget is always defined inside an event listener
                const currentTarget = eventCurrentTargetGetter.call(event)!;
                const actualTarget = getActualTarget(event);
                if (shouldInvokeListener(event, actualTarget, currentTarget)) {
                    getEventHandler(listener).call(currentTarget, event);
                }
            },
        };
        customElementEventListenerMap.set(listener, managedListener);
    }
    return managedListener;
}

function indexOfManagedListener(listeners: ManagedListener[], listener: ManagedListener): number {
    return ArrayFindIndex.call(listeners, (l: ManagedListener) => l.identity === listener.identity);
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
    const bookkeeping: ManagedListener[] = ArraySlice.call(listeners);

    function invokeListenersByPlacement(placement: EventListenerContext) {
        forEach.call(bookkeeping, (listener: ManagedListener) => {
            if (isFalse(immediatePropagationStopped) && listener.placement === placement) {
                // making sure that the listener was not removed from the original listener queue
                if (indexOfManagedListener(listeners, listener) !== -1) {
                    // all handlers on the custom element should be called with undefined 'this'
                    listener.handleEvent.call(undefined, evt);
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

function attachDOMListener(elm: Element, type: string, managedListener: ManagedListener) {
    const listenerMap = getEventMap(elm);
    let listeners = listenerMap[type];
    if (isUndefined(listeners)) {
        listeners = listenerMap[type] = [];
    }
    // Prevent identical listeners from subscribing to the same event type.
    // TODO [#1824]: Options will also play a factor in deduping if we introduce options support
    if (indexOfManagedListener(listeners, managedListener) !== -1) {
        return;
    }
    // only add to DOM if there is no other listener on the same placement yet
    if (listeners.length === 0) {
        addEventListener.call(elm, type, domListener);
    }
    ArrayPush.call(listeners, managedListener);
}

function detachDOMListener(elm: Element, type: string, managedListener: ManagedListener) {
    const listenerMap = getEventMap(elm);
    let index: number;
    let listeners: ManagedListener[] | undefined;
    if (
        !isUndefined((listeners = listenerMap[type])) &&
        (index = indexOfManagedListener(listeners, managedListener)) !== -1
    ) {
        ArraySplice.call(listeners, index, 1);
        // only remove from DOM if there is no other listener on the same placement
        if (listeners.length === 0) {
            removeEventListener.call(elm, type, domListener);
        }
    }
}

export function addCustomElementEventListener(
    this: Element,
    type: string,
    listener: unknown,
    _options?: boolean | AddEventListenerOptions
) {
    if (process.env.NODE_ENV !== 'production') {
        if (!isEventListenerOrEventListenerObject(listener)) {
            throw new TypeError(
                `Invalid second argument for Element.addEventListener() in ${toString(
                    this
                )} for event "${type}". Expected EventListener or EventListenerObject but received ${listener}.`
            );
        }
    }
    if (isEventListenerOrEventListenerObject(listener)) {
        const managedListener = getManagedCustomElementListener(listener);
        attachDOMListener(this, type, managedListener);
    }
}

export function removeCustomElementEventListener(
    this: Element,
    type: string,
    listener: unknown,
    _options?: boolean | AddEventListenerOptions
) {
    if (isEventListenerOrEventListenerObject(listener)) {
        const managedListener = getManagedCustomElementListener(listener);
        detachDOMListener(this, type, managedListener);
    }
}

export function addShadowRootEventListener(
    sr: ShadowRoot,
    type: string,
    listener: unknown,
    _options?: boolean | AddEventListenerOptions
) {
    if (process.env.NODE_ENV !== 'production') {
        if (!isEventListenerOrEventListenerObject(listener)) {
            throw new TypeError(
                `Invalid second argument for ShadowRoot.addEventListener() in ${toString(
                    sr
                )} for event "${type}". Expected EventListener or EventListenerObject but received ${listener}.`
            );
        }
    }
    if (isEventListenerOrEventListenerObject(listener)) {
        const elm = getHost(sr);
        const managedListener = getManagedShadowRootListener(listener);
        attachDOMListener(elm, type, managedListener);
    }
}

export function removeShadowRootEventListener(
    sr: ShadowRoot,
    type: string,
    listener: unknown,
    _options?: boolean | AddEventListenerOptions
) {
    if (isEventListenerOrEventListenerObject(listener)) {
        const elm = getHost(sr);
        const managedListener = getManagedShadowRootListener(listener);
        detachDOMListener(elm, type, managedListener);
    }
}
