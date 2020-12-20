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
    getPropertyDescriptor,
    isFalse,
    isFunction,
    isNull,
    isTrue,
    isUndefined,
    toString,
} from '@lwc/shared';
import { getHost, SyntheticShadowRootInterface, getShadowRoot } from './shadow-root';
import { pathComposer } from '../3rdparty/polymer/path-composer';
import { retarget } from '../3rdparty/polymer/retarget';
import { eventCurrentTargetGetter, eventTargetGetter } from '../env/dom';
import { addEventListener, removeEventListener } from '../env/event-target';
import { compareDocumentPosition, DOCUMENT_POSITION_CONTAINED_BY } from '../env/node';
import { EventListenerContext, getEventContext, setEventContext } from '../shared/event-context';
import { isNodeDeepShadowed } from '../shared/node-ownership';

interface WrappedListener extends EventListener {
    placement: EventListenerContext;
    original: EventListener;
}

function isChildNode(root: Element, node: Node): boolean {
    return !!(compareDocumentPosition.call(root, node) & DOCUMENT_POSITION_CONTAINED_BY);
}

const GET_ROOT_NODE_CONFIG_FALSE = { composed: false };

function getRootNodeHost(node: Node, options: GetRootNodeOptions): Node {
    let rootNode = node.getRootNode(options);

    // is SyntheticShadowRootInterface
    if ('mode' in rootNode && 'delegatesFocus' in rootNode) {
        rootNode = getHost(rootNode);
    }

    return rootNode;
}

export function doesEventNeedPatch(e: Event): boolean {
    const originalTarget = eventTargetGetter.call(e);
    return originalTarget instanceof Node && isNodeDeepShadowed(originalTarget);
}

const patchedEvents: WeakSet<Event> = new WeakSet();

export function patchEvent(event: Event) {
    if (patchedEvents.has(event)) {
        return;
    }
    patchedEvents.add(event);

    // not all events implement the relatedTarget getter, that's why we need to extract it from the instance
    // Note: we can't really use the super here because of issues with the typescript transpilation for accessors
    const originalRelatedTargetDescriptor = getPropertyDescriptor(event, 'relatedTarget');
    if (!isUndefined(originalRelatedTargetDescriptor)) {
        const relatedTargetGetter: (
            this: Event
        ) => EventTarget | null = originalRelatedTargetDescriptor.get!;
        defineProperty(event, 'relatedTarget', {
            get(this: Event): EventTarget | null | undefined {
                const eventContext = getEventContext(this);
                const originalCurrentTarget = eventCurrentTargetGetter.call(this);
                const relatedTarget = relatedTargetGetter.call(this);
                if (isNull(relatedTarget)) {
                    return null;
                }
                const currentTarget =
                    eventContext === EventListenerContext.SHADOW_ROOT_LISTENER
                        ? getShadowRoot(
                              originalCurrentTarget as HTMLElement
                          ) /* because the context is a host */
                        : originalCurrentTarget;

                return retarget(currentTarget, pathComposer(relatedTarget, true));
            },
            enumerable: true,
            configurable: true,
        });
    }
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

export const eventsDispatchedDirectlyOnShadowRoot: WeakSet<Event> = new WeakSet();

export function setEventFromShadowRoot(event: Event) {
    eventsDispatchedDirectlyOnShadowRoot.add(event);
}

const shadowRootEventListenerMap: WeakMap<EventListener, WrappedListener> = new WeakMap();

function getWrappedShadowRootListener(
    sr: SyntheticShadowRootInterface,
    listener: EventListener
): WrappedListener {
    if (!isFunction(listener)) {
        throw new TypeError(); // avoiding problems with non-valid listeners
    }
    let shadowRootWrappedListener = shadowRootEventListenerMap.get(listener);
    if (isUndefined(shadowRootWrappedListener)) {
        shadowRootWrappedListener = function (event: Event) {
            if (shouldInvokeShadowRootListener(event)) {
                listener.call(sr, event);
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

function getWrappedCustomElementListener(elm: Element, listener: EventListener): WrappedListener {
    if (!isFunction(listener)) {
        throw new TypeError(); // avoiding problems with non-valid listeners
    }
    let customElementWrappedListener = customElementEventListenerMap.get(listener);
    if (isUndefined(customElementWrappedListener)) {
        customElementWrappedListener = function (event: Event) {
            if (shouldInvokeCustomEventListener(event)) {
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
    patchEvent(evt);
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

function shouldInvokeCustomEventListener(event: Event): boolean {
    const target = eventTargetGetter.call(event);
    const currentTarget = eventCurrentTargetGetter.call(event);
    const { composed } = event;

    let shouldInvoke = false;

    if (isTrue(composed)) {
        shouldInvoke = true;
    } else if (target === currentTarget) {
        // Address the possibility that `target` is a shadow root
        shouldInvoke = !eventsDispatchedDirectlyOnShadowRoot.has(event);
    } else {
        // it is coming from a slotted element
        shouldInvoke = isChildNode(
            getRootNodeHost(
                target as Node /* because wrap on shadowRoot */,
                GET_ROOT_NODE_CONFIG_FALSE
            ) as Element,
            currentTarget as Node
        );
    }

    return shouldInvoke;
}

function shouldInvokeShadowRootListener(event: Event): boolean {
    const { composed } = event;

    let shouldInvoke = false;

    if (isTrue(composed)) {
        shouldInvoke = true;
    } else {
        const target = eventTargetGetter.call(event);
        const currentTarget = eventCurrentTargetGetter.call(event);

        if (eventsDispatchedDirectlyOnShadowRoot.has(event)) {
            // If this event was directly dispatched on a root, then we should only handle
            // it if it was dispatched on the current root because {composed: false} here.
            shouldInvoke = target === currentTarget;
        } else {
            // The event was not dispatched directly on the current root so it must be bubbles:true.
            // { bubbles: true, composed: false }

            // Only invoke the listener if the target element is in the current root.
            const currentRoot = getShadowRoot(currentTarget as HTMLElement);
            const targetRoot = (target as HTMLElement).getRootNode();
            shouldInvoke = currentRoot === targetRoot;
        }
    }

    return shouldInvoke;
}

export function addCustomElementEventListener(
    elm: Element,
    type: string,
    listener: EventListenerOrEventListenerObject,
    _options?: boolean | AddEventListenerOptions
) {
    if (process.env.NODE_ENV !== 'production') {
        if (!isFunction(listener)) {
            throw new TypeError(
                `Invalid second argument for Element.addEventListener() in ${toString(
                    elm
                )} for event "${type}". Expected an EventListener but received ${listener}.`
            );
        }
    }
    // TODO [#1824]: Lift this restriction on the option parameter
    if (isFunction(listener)) {
        const wrappedListener = getWrappedCustomElementListener(elm, listener);
        attachDOMListener(elm, type, wrappedListener);
    }
}

export function removeCustomElementEventListener(
    elm: Element,
    type: string,
    listener: EventListenerOrEventListenerObject,
    _options?: boolean | AddEventListenerOptions
) {
    // TODO [#1824]: Lift this restriction on the option parameter
    if (isFunction(listener)) {
        const wrappedListener = getWrappedCustomElementListener(elm, listener);
        detachDOMListener(elm, type, wrappedListener);
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
        const wrappedListener = getWrappedShadowRootListener(sr, listener);
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
        const wrappedListener = getWrappedShadowRootListener(sr, listener);
        detachDOMListener(elm, type, wrappedListener);
    }
}
