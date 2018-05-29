import assert from "./assert";
import {
    addEventListener,
    removeEventListener,
} from "./dom/element";
import {
    getRootNode,
    parentNodeGetter,
} from "./dom/node";
import { VM, OwnerKey, getElementOwnerVM, getCustomElementVM } from "./vm";
import { isNull, ArraySplice, ArrayIndexOf, create, ArrayPush, isUndefined, isFunction, getOwnPropertyDescriptor, defineProperties, isTrue } from "./language";
import { isRendering, vmBeingRendered, invokeEventListener, EventListenerContext, componentEventListenerType } from "./invoker";
import { patchShadowDomTraversalMethods } from "./dom/traverse";

interface WrappedListener extends EventListener {
    placement: EventListenerContext;
    original: EventListener;
}

import { compareDocumentPosition, DOCUMENT_POSITION_CONTAINED_BY } from "./dom/node";

function isChildNode(root: Element, node: Node): boolean {
    return !!(compareDocumentPosition.call(root, node) & DOCUMENT_POSITION_CONTAINED_BY);
}

const eventTargetGetter = getOwnPropertyDescriptor(Event.prototype, 'target')!.get!;
const GET_ROOT_NODE_CONFIG_FALSE = { composed: false };

const eventShadowDescriptors: PropertyDescriptorMap = {
    target: {
        get(this: Event): HTMLElement {
            const { currentTarget } = this;
            const originalTarget: HTMLElement = eventTargetGetter.call(this);

            // Executing event listener on component, target is always currentTarget
            if (componentEventListenerType === EventListenerContext.COMPONENT_LISTENER) {
                return patchShadowDomTraversalMethods(currentTarget as HTMLElement);
            }

            // Handle events is coming from an slotted elements.
            // TODO: Add more information why we need to handle the light DOM events here.
            if (isChildNode(getRootNode.call(originalTarget, GET_ROOT_NODE_CONFIG_FALSE), currentTarget as Element)) {
                return patchShadowDomTraversalMethods(originalTarget);
            }

            let vm: VM | undefined;
            if (componentEventListenerType === EventListenerContext.ROOT_LISTENER) {
                // If we are in an event listener attached on the shadow root, then we do not want to look
                // for the currentTarget owner VM because the currentTarget owner VM would be the VM which
                // rendered the component (parent component).
                //
                // Instead, we want to get the custom element's VM because that VM owns the shadow root itself.
                vm = getCustomElementVM(currentTarget as HTMLElement);
            } else if (!isUndefined(currentTarget)) {
                // TODO: When does currentTarget can be undefined
                vm = getElementOwnerVM(currentTarget as Element);
            }

            // Handle case when VM is not present for example when attaching an event listener
            // on the root component of the component tree.
            if (!isUndefined(vm)) {
                let node = originalTarget;
                while (!isNull(node) && vm.uid !== node[OwnerKey]) {
                    node = parentNodeGetter.call(node);
                }
                return patchShadowDomTraversalMethods(node);
            }
            return originalTarget;
        },
        configurable: true,
    },
};

export function patchShadowDomEvent(vm: VM, event: Event) {
    if (isTrue(vm.fallback)) {
        defineProperties(event, eventShadowDescriptors);
    }
}

const rootEventListenerMap: WeakMap<EventListener, WrappedListener> = new WeakMap();

function getWrappedRootListener(vm: VM, listener: EventListener): WrappedListener {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    if (!isFunction(listener)) {
        throw new TypeError(); // avoiding problems with non-valid listeners
    }
    let wrappedListener = rootEventListenerMap.get(listener);
    if (isUndefined(wrappedListener)) {
        wrappedListener = function(event: Event) {
            // * if the event is dispatched directly on the host, it is not observable from root
            // * if the event is dispatched in an element that does not belongs to the shadow and it is not composed,
            //   it is not observable from the root
            const { composed, target, currentTarget } = event as any;
            if (
                // it is composed and was not dispatched onto the custom element directly
                (composed === true && target !== currentTarget) ||
                // it is coming from an slotted element
                isChildNode(getRootNode.call(target, event), currentTarget as Node) ||
                // it is not composed and its is coming from from shadow
                (composed === false && getRootNode.call(event.target) === currentTarget)) {
                    patchShadowDomEvent(vm, event);
                    invokeEventListener(vm, EventListenerContext.ROOT_LISTENER, listener, undefined, event);
            }
        } as WrappedListener;
        wrappedListener!.placement = EventListenerContext.ROOT_LISTENER;
        if (process.env.NODE_ENV !== 'production') {
            wrappedListener!.original = listener; // for logging purposes
        }
        rootEventListenerMap.set(listener, wrappedListener);
    }
    return wrappedListener;
}

const cmpEventListenerMap: WeakMap<EventListener, WrappedListener> = new WeakMap();

function getWrappedComponentsListener(vm: VM, listener: EventListener): WrappedListener {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    if (!isFunction(listener)) {
        throw new TypeError(); // avoiding problems with non-valid listeners
    }
    let wrappedListener = cmpEventListenerMap.get(listener);
    if (isUndefined(wrappedListener)) {
        wrappedListener = function(event: Event) {
            if (isValidEventForCustomElement(event)) {
                patchShadowDomEvent(vm, event);
                invokeEventListener(vm, EventListenerContext.COMPONENT_LISTENER, listener, undefined, event);
            }
        } as WrappedListener;
        wrappedListener!.placement = EventListenerContext.COMPONENT_LISTENER;
        if (process.env.NODE_ENV !== 'production') {
            wrappedListener!.original = listener; // for logging purposes
        }
        cmpEventListenerMap.set(listener, wrappedListener);
    }
    return wrappedListener;
}

function createElementEventListener(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }

    return function(this: Event, evt: Event) {
        let interrupted = false;
        const { type, stopImmediatePropagation } = evt;
        const { cmpEvents } = vm;
        const listeners = cmpEvents![type] as WrappedListener[]; // it must have listeners at this point
        const len = listeners.length;
        evt.stopImmediatePropagation = function() {
            interrupted = true;
            stopImmediatePropagation.call(this);
        };
        for (let i = 0; i < len; i += 1) {
            if (listeners[i].placement === EventListenerContext.ROOT_LISTENER) {
                // all handlers on the custom element should be called with undefined 'this'
                listeners[i].call(undefined, evt);
                if (interrupted) {
                    return;
                }
            }
        }
        for (let i = 0; i < len; i += 1) {
            if (listeners[i].placement === EventListenerContext.COMPONENT_LISTENER) {
                // all handlers on the custom element should be called with undefined 'this'
                listeners[i].call(undefined, evt);
                if (interrupted) {
                    return;
                }
            }
        }
    };
}

function attachDOMListener(vm: VM, type: string, wrappedListener: WrappedListener) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    let { cmpListener, cmpEvents } = vm;
    if (isUndefined(cmpListener)) {
        cmpListener = vm.cmpListener = createElementEventListener(vm);
    }
    if (isUndefined(cmpEvents)) {
        cmpEvents = vm.cmpEvents = create(null) as Record<string, WrappedListener[]>;
    }

    let cmpEventHandlers = cmpEvents[type];
    if (isUndefined(cmpEventHandlers)) {
        cmpEventHandlers = cmpEvents[type] = [];
    }
    // only add to DOM if there is no other listener on the same placement yet
    if (cmpEventHandlers.length === 0) {
        addEventListener.call(vm.elm, type, cmpListener);
    } else if (process.env.NODE_ENV !== 'production') {
        if (ArrayIndexOf.call(cmpEventHandlers, wrappedListener) !== -1) {
            assert.logWarning(`${vm} has duplicate listener ${wrappedListener.original} for event "${type}". Instead add the event listener in the connectedCallback() hook.`);
        }
    }
    ArrayPush.call(cmpEventHandlers, wrappedListener);
}

function detachDOMListener(vm: VM, type: string, wrappedListener: WrappedListener) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    const { cmpEvents } = vm;
    let p: number;
    let listeners: EventListener[] | undefined;
    if (!isUndefined(cmpEvents) && !isUndefined(listeners = cmpEvents[type]) && (p = ArrayIndexOf.call(listeners, wrappedListener)) !== -1) {
        ArraySplice.call(listeners, p, 1);
        // only remove from DOM if there is no other listener on the same placement
        if (listeners!.length === 0) {
            removeEventListener.call(vm.elm, type, vm.cmpListener);
        }
    } else if (process.env.NODE_ENV !== 'production') {
        assert.logError(`Did not find event listener ${wrappedListener.original} for event "${type}" on ${vm}. This is probably a typo or a life cycle mismatch. Make sure that you add the right event listeners in the connectedCallback() hook and remove them in the disconnectedCallback() hook.`);
    }
}

const NON_COMPOSED = { composed: false };
export function isValidEventForCustomElement(event: Event): boolean {
    const { target, currentTarget } = event;
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

export function addTemplateEventListener(vm: VM, type: string, listener: EventListener) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    // not need to wrap this listener because it is already wrapped by api.b()
    (listener as WrappedListener).placement = EventListenerContext.COMPONENT_LISTENER;
    attachDOMListener(vm, type, (listener as WrappedListener));
}

export function removeTemplateEventListener(vm: VM, type: string, listener: EventListener) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    detachDOMListener(vm, type, (listener as WrappedListener));
}

export function addCmpEventListener(vm: VM, type: string, listener: EventListener) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm} by adding an event listener for "${type}".`);
        assert.invariant(isFunction(listener), `Invalid second argument for this.template.addEventListener() in ${vm} for event "${type}". Expected an EventListener but received ${listener}.`);
    }
    const wrappedListener = getWrappedComponentsListener(vm, listener);
    attachDOMListener(vm, type, wrappedListener);
}

export function removeCmpEventListener(vm: VM, type: string, listener: EventListener) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    const wrappedListener = getWrappedComponentsListener(vm, listener);
    detachDOMListener(vm, type, wrappedListener);
}

export function addRootEventListener(vm: VM, type: string, listener: EventListener) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm} by adding an event listener for "${type}".`);
        assert.invariant(isFunction(listener), `Invalid second argument for this.template.addEventListener() in ${vm} for event "${type}". Expected an EventListener but received ${listener}.`);
    }
    const wrappedListener = getWrappedRootListener(vm, listener);
    attachDOMListener(vm, type, wrappedListener);
}

export function removeRootEventListener(vm: VM, type: string, listener: EventListener) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    const wrappedListener = getWrappedRootListener(vm, listener);
    detachDOMListener(vm, type, wrappedListener);
}
