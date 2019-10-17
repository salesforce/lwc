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
    isUndefined,
} from '@lwc/shared';
import { getHost, SyntheticShadowRootInterface } from './shadow-root';
import { eventCurrentTargetGetter, eventTargetGetter } from '../env/dom';
import { addEventListener, removeEventListener } from '../env/element';
import { setEventContext, EventListenerContext } from '../shared/event-context';

interface WrappedListener extends EventListener {
    placement: EventListenerContext;
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

const shadowRootEventListenerMap: WeakMap<EventListener, WrappedListener> = new WeakMap();
// Using a WeakMap instead of a WeakSet because this one works in IE11 :(
const eventsComingFromShadowRoot: WeakMap<Event, 1> = new WeakMap();

function isEventComingFromShadowRoot(event: Event): boolean {
    return eventsComingFromShadowRoot.has(event);
}

export function setEventFromShadowRoot(event: Event) {
    eventsComingFromShadowRoot.set(event, 1);
}

function getWrappedShadowRootListener(
    sr: SyntheticShadowRootInterface,
    listener: EventListener
): WrappedListener {
    let shadowRootWrappedListener = shadowRootEventListenerMap.get(listener);
    if (isUndefined(shadowRootWrappedListener)) {
        shadowRootWrappedListener = function(event: Event) {
            const target = eventTargetGetter.call(event);
            const currentTarget = eventCurrentTargetGetter.call(event);
            // An event that is dispatched directly into the shadowRoot instance vs an event that is dispatched
            // on the host instance directly are difficult to distinguish. We mark the event on the shadowRoot's
            // dispatchEvent method, so we know it is a valid event for the shadowRoot.
            if (target !== currentTarget || isEventComingFromShadowRoot(event)) {
                listener.call(sr, event);
            }
        } as WrappedListener;
        shadowRootWrappedListener!.placement = EventListenerContext.SHADOW_ROOT_LISTENER;
        shadowRootEventListenerMap.set(listener, shadowRootWrappedListener);
    }
    return shadowRootWrappedListener;
}

function domListener(evt: Event) {
    let immediatePropagationStopped = false;
    let propagationStopped = false;
    const { type, stopImmediatePropagation, stopPropagation } = evt;
    // currentTarget is always defined
    const currentTarget = eventCurrentTargetGetter.call(evt) as EventTarget;
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

    setEventContext(evt, EventListenerContext.SHADOW_ROOT_LISTENER);
    invokeListenersByPlacement(EventListenerContext.SHADOW_ROOT_LISTENER);
    if (isFalse(immediatePropagationStopped) && isFalse(propagationStopped)) {
        // doing the second iteration only if the first one didn't interrupt the event propagation
        setEventContext(evt, EventListenerContext.CUSTOM_ELEMENT_LISTENER);
        invokeListenersByPlacement(EventListenerContext.CUSTOM_ELEMENT_LISTENER);
    }
    setEventContext(evt, EventListenerContext.UNKNOWN_LISTENER);
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
        if (listeners!.length === 0) {
            removeEventListener.call(elm, type, domListener);
        }
    }
}

export function addCustomElementEventListener(
    this: Element,
    type: string,
    listener: EventListener,
    _options?: boolean | AddEventListenerOptions
) {
    const wrappedListener: WrappedListener = listener as WrappedListener;
    wrappedListener.placement = EventListenerContext.CUSTOM_ELEMENT_LISTENER;
    attachDOMListener(this, type, wrappedListener);
}

export function removeCustomElementEventListener(
    this: Element,
    type: string,
    listener: EventListener,
    _options?: boolean | AddEventListenerOptions
) {
    const wrappedListener: WrappedListener = listener as WrappedListener;
    detachDOMListener(this, type, wrappedListener);
}

export function addShadowRootEventListener(
    sr: SyntheticShadowRootInterface,
    type: string,
    listener: EventListener,
    _options?: boolean | AddEventListenerOptions
) {
    const elm = getHost(sr);
    const wrappedListener = getWrappedShadowRootListener(sr, listener);
    attachDOMListener(elm, type, wrappedListener);
}

export function removeShadowRootEventListener(
    sr: SyntheticShadowRootInterface,
    type: string,
    listener: EventListener,
    _options?: boolean | AddEventListenerOptions
) {
    const elm = getHost(sr);
    const wrappedListener = getWrappedShadowRootListener(sr, listener);
    detachDOMListener(elm, type, wrappedListener);
}
