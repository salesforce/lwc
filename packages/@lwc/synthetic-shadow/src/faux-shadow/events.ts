/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from '../shared/assert';
import { compareDocumentPosition, DOCUMENT_POSITION_CONTAINED_BY } from '../env/node';
import {
    ArraySlice,
    ArraySplice,
    ArrayIndexOf,
    create,
    ArrayPush,
    isUndefined,
    isFunction,
    defineProperties,
    toString,
    forEach,
    defineProperty,
    isFalse,
    isNull,
    getPropertyDescriptor,
} from '../shared/language';
import { getHost, SyntheticShadowRootInterface, getShadowRoot } from './shadow-root';
import { eventCurrentTargetGetter, eventTargetGetter } from '../env/dom';
import { pathComposer } from './../3rdparty/polymer/path-composer';
import { retarget } from './../3rdparty/polymer/retarget';
import { getOwnerDocument } from '../shared/utils';
import { addEventListener } from '../env/element';

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
    let rootNode = node.getRootNode(options);

    // is SyntheticShadowRootInterface
    if ('mode' in rootNode && 'delegatesFocus' in rootNode) {
        rootNode = getHost(rootNode);
    }

    return rootNode;
}

type ComposableEvent = Event & {
    composed: boolean;
};

function targetGetter(this: ComposableEvent): EventTarget | null {
    // currentTarget is always defined
    const originalCurrentTarget = eventCurrentTargetGetter.call(this);
    const originalTarget = eventTargetGetter.call(this);
    const composedPath = pathComposer(originalTarget, this.composed);

    // Handle cases where the currentTarget is null (for async events),
    // and when an event has been added to Window
    if (!(originalCurrentTarget instanceof Node)) {
        const doc = getOwnerDocument(originalTarget as Node);
        return retarget(doc, composedPath);
    }

    const eventContext = eventToContextMap.get(this);
    const currentTarget =
        eventContext === EventListenerContext.SHADOW_ROOT_LISTENER
            ? getShadowRoot(originalCurrentTarget as HTMLElement)
            : originalCurrentTarget;
    return retarget(currentTarget, composedPath);
}

function composedPathValue(this: ComposableEvent): EventTarget[] {
    const originalTarget: EventTarget = eventTargetGetter.call(this);
    const originalCurrentTarget = eventCurrentTargetGetter.call(this);
    // if the dispatch phase is done, the composedPath should be empty array
    return isNull(originalCurrentTarget) ? [] : pathComposer(originalTarget as Node, this.composed);
}

export function patchEvent(event: Event) {
    if (eventToContextMap.has(event)) {
        return; // already patched
    }
    defineProperties(event, {
        target: {
            get: targetGetter,
            enumerable: true,
            configurable: true,
        },
        composedPath: {
            value: composedPathValue,
            writable: true,
            enumerable: true,
            configurable: true,
        },
        // non-standard but important accessor
        srcElement: {
            get: targetGetter,
            enumerable: true,
            configurable: true,
        },
        path: {
            get: composedPathValue,
            enumerable: true,
            configurable: true,
        },
    });
    // not all events implement the relatedTarget getter, that's why we need to extract it from the instance
    // Note: we can't really use the super here because of issues with the typescript transpilation for accessors
    const originalRelatedTargetDescriptor = getPropertyDescriptor(event, 'relatedTarget');
    if (!isUndefined(originalRelatedTargetDescriptor)) {
        const relatedTargetGetter: (
            this: ComposableEvent
        ) => EventTarget | null = originalRelatedTargetDescriptor.get!;
        defineProperty(event, 'relatedTarget', {
            get(this: ComposableEvent): EventTarget | null | undefined {
                const eventContext = eventToContextMap.get(this);
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
    eventToContextMap.set(event, 0);
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

function getWrappedShadowRootListener(
    sr: SyntheticShadowRootInterface,
    listener: EventListener
): WrappedListener {
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
                const rootNode = getRootNodeHost(
                    target as Node /* because wrapping on shadowRoot */,
                    {
                        composed,
                    }
                );

                if (
                    isChildNode(rootNode as HTMLElement, currentTarget as Node) ||
                    (composed === false && rootNode === currentTarget)
                ) {
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

function getWrappedCustomElementListener(elm: Element, listener: EventListener): WrappedListener {
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
    patchEvent(evt);
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

    eventToContextMap.set(evt, EventListenerContext.SHADOW_ROOT_LISTENER);
    invokeListenersByPlacement(EventListenerContext.SHADOW_ROOT_LISTENER);
    if (isFalse(immediatePropagationStopped) && isFalse(propagationStopped)) {
        // doing the second iteration only if the first one didn't interrupt the event propagation
        eventToContextMap.set(evt, EventListenerContext.CUSTOM_ELEMENT_LISTENER);
        invokeListenersByPlacement(EventListenerContext.CUSTOM_ELEMENT_LISTENER);
    }
    eventToContextMap.set(evt, 0);
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
        isChildNode(
            getRootNodeHost(
                target as Node /* because wrap on shadowRoot */,
                GET_ROOT_NODE_CONFIG_FALSE
            ) as Element,
            currentTarget as Node
        )
    );
}

export function addCustomElementEventListener(
    elm: Element,
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            isFunction(listener),
            `Invalid second argument for this.addEventListener() in ${toString(
                elm
            )} for event "${type}". Expected an EventListener but received ${listener}.`
        );
        // TODO: #420 - this is triggered when the component author attempts to add a listener
        // programmatically into a lighting element node
        if (!isUndefined(options)) {
            assert.logError(
                'The `addEventListener` method in `LightningElement` does not support any options.',
                elm
            );
        }
    }
    const wrappedListener = getWrappedCustomElementListener(elm, listener);
    attachDOMListener(elm, type, wrappedListener);
}

export function removeCustomElementEventListener(
    elm: Element,
    type: string,
    listener: EventListener,
    _options?: boolean | AddEventListenerOptions
) {
    const wrappedListener = getWrappedCustomElementListener(elm, listener);
    detachDOMListener(elm, type, wrappedListener);
}

export function addShadowRootEventListener(
    sr: SyntheticShadowRootInterface,
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            isFunction(listener),
            `Invalid second argument for this.template.addEventListener() in ${toString(
                sr
            )} for event "${type}". Expected an EventListener but received ${listener}.`
        );
        // TODO: #420 - this is triggered when the component author attempts to add a listener
        // programmatically into its Component's shadow root
        if (!isUndefined(options)) {
            assert.logError(
                'The `addEventListener` method in `LightningElement` does not support any options.',
                getHost(sr)
            );
        }
    }
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
