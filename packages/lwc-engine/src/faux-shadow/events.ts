import assert from "../shared/assert";
import {
    addEventListener,
    removeEventListener,
} from "./element";
import {
    getRootNode,
    parentNodeGetter,
} from "./node";
import { ArraySlice, ArraySplice, ArrayIndexOf, create, ArrayPush, isUndefined, isFunction, getOwnPropertyDescriptor, defineProperties, isNull, toString, forEach, defineProperty, isFalse } from "../shared/language";
import { patchShadowDomTraversalMethods } from "./traverse";
import { compareDocumentPosition, DOCUMENT_POSITION_CONTAINED_BY, getNodeOwnerKey, getNodeKey } from "./node";
import { getHost } from "./shadow-root";

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

const eventTargetGetter: (this: Event) => Element = getOwnPropertyDescriptor(Event.prototype, 'target')!.get!;
const eventCurrentTargetGetter: (this: Event) => Element | null = getOwnPropertyDescriptor(Event.prototype, 'currentTarget')!.get!;
const GET_ROOT_NODE_CONFIG_FALSE = { composed: false };

const EventPatchDescriptors: PropertyDescriptorMap = {
    currentTarget: {
        get(this: Event): EventTarget | null {
            const currentTarget: EventTarget = eventCurrentTargetGetter.call(this);
            if (isNull(currentTarget) || isUndefined(getNodeOwnerKey(currentTarget as Node))) {
                // event is already beyond the boundaries of our controlled shadow roots
                return currentTarget;
            }
            return patchShadowDomTraversalMethods(currentTarget as Element);
        },
        enumerable: true,
        configurable: true,
    },
    target: {
        get(this: Event): EventTarget {
            const currentTarget: EventTarget = eventCurrentTargetGetter.call(this);
            const originalTarget: EventTarget = eventTargetGetter.call(this);

            // Handle cases where the currentTarget is null (for async events)
            // and when currentTarget is window.
            if (!(currentTarget instanceof Node)) {
                // the event was inspected asynchronously, in which case we need to return the
                // top custom element the belongs to the body.
                let outerMostElement = originalTarget;
                let parentNode;
                while ((parentNode = parentNodeGetter.call(outerMostElement)) && !isUndefined(getNodeOwnerKey(outerMostElement as Node))) {
                    outerMostElement = parentNode;
                }

                // This value will always be the root LWC node.
                // There is a chance that this value will be accessed
                // inside of an async event handler in the component tree,
                // but because we don't know if it is being accessed
                // inside the tree or outside the tree, we do not patch.
                return outerMostElement;
            }
            const eventContext = eventToContextMap.get(this);

            // Retarget to currentTarget if the listener was added to a custom element.
            if (eventContext === EventListenerContext.CUSTOM_ELEMENT_LISTENER) {
                return patchShadowDomTraversalMethods(currentTarget as Element);
            }

            const currentTargetRootNode = getRootNode.call(currentTarget, GET_ROOT_NODE_CONFIG_FALSE);

            // We need to determine three things in order to retarget correctly:
            // 1) What VM context was the listener added? (e.g. in what VM context was addEventListener called in).
            // 2) What VM owns the context where the listener was added? (e.g. who rendered the VM context from step 1).
            // 3) What is the event's original target's relationship to 1 and 2?

            // Determining Number 1:
            // In most cases, the VM context maps to the currentTarget's owner VM. This will correspond to the custom element:
            //
            // // x-parent.html
            // <template>
            //  <!--
            //    This listener is added inside of <x-parent>'s template
            //    so its VM context will be <x-parent>'s VM
            //  -->
            //  <div onclick={handleClick}</div>
            // </template>
            //
            // In the case of this.template.addEventListener, the VM context needs to be the custom element's VM, NOT the owner VM.
            //
            // // x-parent.js
            // connectedCallback() {
            //   The event below is attached to x-parent's shadow root.
            //   Under the hood, we add the event listener to the custom element.
            //   Because template events happen INSIDE the custom element's shadow,
            //   we CANNOT get the owner VM. Instead, we must get the custom element's VM instead.
            //   this.template.addEventListener('click', () => {});
            // }
            const myCurrentShadowKey = (eventContext === EventListenerContext.SHADOW_ROOT_LISTENER) ? getNodeKey(currentTarget as Node) : getNodeOwnerKey(currentTarget as Node);

            // Determine Number 2:
            // The easy part: The VM context owner is always the event's currentTarget OwnerKey:
            // NOTE: if the current target is the shadow root, the way we collect the Context owner's key is different because
            //       currentTargetRootNode is both: shadow root and custom element.
            const myOwnerKey = (eventContext === EventListenerContext.SHADOW_ROOT_LISTENER) ? getNodeKey(currentTargetRootNode) : getNodeOwnerKey(currentTargetRootNode);

            // Determining Number 3:
            // Because we only support bubbling and we are already inside of an event, we know that the original event target
            // is an ancestor of the currentTarget. The key here, is that we have to determine if the event is coming from an
            // element inside of the attached shadow context (#1 above) or from the owner context (#2).
            // We determine this by traversing up the DOM until either 1) We come across an element that has the same VM as #1
            // Or we come across an element that has the same VM as #2.
            //
            // If we come across an element that has the same VM as #1, we have an element that was rendered inside #1 template:
            //
            // <template>
            //   <x-foo onClick={handleClick}> <!-- VM is equal to #1, this is our target
            //      # shadow
            //           <div> <-- VM is not equal to #1 or #2, keep going
            //              <span>  <-- click event happened
            // </template>
            //
            //
            // If we come across an element that has the same VM as #2, we have an element that was rendered inside #1 slot:
            // <template>
            //  <div onClick={handleClick}>
            //    <slot>
            //      <x-bar> <-- VM is equal to #2, this is our target
            //        # x-bar shadow
            //          <div> <-- VM is not equal to #1 or #2, keep going
            //            <x-baz>  <-- VM is not equal to #1 or #2, keep going
            //              # x-baz shadow
            //                <span></span>  <-- click event happened
            //            </x-baz>
            //          </div>
            //      </x-bar>
            //    </slot>
            //  </div>
            // </template>
            //
            let closestTarget = originalTarget;
            let nodeOwnerKey = getNodeOwnerKey(closestTarget as Node);
            while (nodeOwnerKey !== myCurrentShadowKey && nodeOwnerKey !== myOwnerKey) {
                closestTarget = parentNodeGetter.call(closestTarget);
                // In this case, the original target is in a detached root, making it
                // impossible to retarget (unless we figure out something clever).
                if (closestTarget === null) {
                    return originalTarget;
                }
                nodeOwnerKey = getNodeOwnerKey(closestTarget as Node);
            }

            /**
             * <div> <-- document.querySelector('div').addEventListener('click')
             *    <x-foo></x-foo> <-- this.addEventListener('click') in constructor
             * </div>
             *
             * or
             *
             * <x-foo></x-foo> <-- document.querySelector('x-foo').addEventListener('click')
             * while the event is patched because the component is listening for it internally
             * via this.addEventListener('click') in constructor or something similar
             */
            if (isUndefined(getNodeOwnerKey(closestTarget as Node))) {
                return closestTarget;
            }
            return patchShadowDomTraversalMethods(closestTarget as Element);
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

function getWrappedShadowRootListener(sr: ShadowRoot, listener: EventListener): WrappedListener {
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
            if (
                // it is composed and was not dispatched onto the custom element directly
                (composed === true && target !== currentTarget) ||
                // it is coming from an slotted element
                isChildNode(getRootNode.call(target, event), currentTarget as Node) ||
                // it is not composed and its is coming from from shadow
                (composed === false && getRootNode.call(target) === currentTarget)) {
                    // TODO: we should figure why `undefined` makes sense here
                    // and how this is going to work for native shadow root?
                    listener.call(undefined, event);
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
            assert.logWarning(`${toString(elm)} has duplicate listener ${wrappedListener.original} for event "${type}". Instead add the event listener in the connectedCallback() hook.`);
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
        assert.logError(`Did not find event listener ${wrappedListener.original} for event "${type}" on ${toString(elm)}. This is probably a typo or a life cycle mismatch. Make sure that you add the right event listeners in the connectedCallback() hook and remove them in the disconnectedCallback() hook.`);
    }
}

const NON_COMPOSED = { composed: false };
function isValidEventForCustomElement(event: Event): boolean {
    const target = eventTargetGetter.call(event);
    const currentTarget = eventCurrentTargetGetter.call(event);
    const { composed } = event as any;
    return (
        // it is composed, and we should always get it, or
        composed === true ||
        // it is dispatched onto the custom element directly, or
        target === currentTarget ||
        // it is coming from an slotted element
        isChildNode(getRootNode.call(target, NON_COMPOSED), currentTarget as Node)
    );
}

export function addCustomElementEventListener(elm: HTMLElement, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isFunction(listener), `Invalid second argument for this.template.addEventListener() in ${toString(elm)} for event "${type}". Expected an EventListener but received ${listener}.`);
        // TODO: issue #420
        // this is triggered when the component author attempts to add a listener programmatically into a lighting element node
        if (!isUndefined(options)) {
            assert.logWarning(`The 'addEventListener' method in 'LightningElement' does not support more than 2 arguments. Options to make the listener passive, once, or capture are not allowed: ${toString(options)} in ${toString(elm)}`);
        }
    }
    const wrappedListener = getWrappedCustomElementListener(elm, listener);
    attachDOMListener(elm, type, wrappedListener);
}

export function removeCustomElementEventListener(elm: HTMLElement, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
    const wrappedListener = getWrappedCustomElementListener(elm, listener);
    detachDOMListener(elm, type, wrappedListener);
}

export function addShadowRootEventListener(sr: ShadowRoot, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isFunction(listener), `Invalid second argument for this.template.addEventListener() in ${toString(sr)} for event "${type}". Expected an EventListener but received ${listener}.`);
        // TODO: issue #420
        // this is triggered when the component author attempts to add a listener programmatically into its Component's shadow root
        if (!isUndefined(options)) {
            assert.logWarning(`The 'addEventListener' method in 'ShadowRoot' does not support more than 2 arguments. Options to make the listener passive, once, or capture are not allowed: ${toString(options)} in ${toString(sr)}`);
        }
    }
    const elm = getHost(sr);
    const wrappedListener = getWrappedShadowRootListener(sr, listener);
    attachDOMListener(elm, type, wrappedListener);
}

export function removeShadowRootEventListener(sr: ShadowRoot, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
    const elm = getHost(sr);
    const wrappedListener = getWrappedShadowRootListener(sr, listener);
    detachDOMListener(elm, type, wrappedListener);
}
