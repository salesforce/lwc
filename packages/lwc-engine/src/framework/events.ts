import assert from "./assert";
import {
    addEventListener,
    removeEventListener,
} from "./dom/element";
import {
    getRootNode,
    parentNodeGetter,
} from "./dom/node";
import { VM, OwnerKey, getCustomElementVM } from "./vm";
import { ArraySplice, ArrayIndexOf, create, ArrayPush, isUndefined, isFunction, getOwnPropertyDescriptor, defineProperties, isTrue } from "./language";
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
            const currentTarget = this.currentTarget as HTMLElement;
            const originalTarget = eventTargetGetter.call(this);
            // Executing event listener on component, target is always currentTarget

            if (componentEventListenerType === EventListenerContext.COMPONENT_LISTENER) {
                return patchShadowDomTraversalMethods(currentTarget);
            }
            const currentTargetRootNode = getRootNode.call(currentTarget, GET_ROOT_NODE_CONFIG_FALSE); // x-child

            // Before we can process any events, we need to first determing three things:
            // 1) What VM context was the event attached to? (e.g. in what VM context was addEventListener called in).
            // 2) What VM owns the context where the event was attached? (e.g. who rendered the VM context from step 1).
            // 3) What is the event's original target's relationship to 1 and 2?

            // Determining Number 1:
            // In most cases, the VM context maps to the currentTarget's owner VM. This will correspond to the custom element:
            //
            // // x-parent.html
            // <template>
            //  <!--
            //    The event below is attached inside of x-parent's template
            //    so vm context will be <x-parent>'s owner VM
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
            const myCurrentShadowKey = (componentEventListenerType === EventListenerContext.ROOT_LISTENER) ? getCustomElementVM(currentTarget).uid : currentTarget[OwnerKey];

            // Determinimg Number 2:
            // The easy part: The VM context owner is always the event's currentTarget OwnerKey:
            const myOwnerKey = currentTargetRootNode[OwnerKey];

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
            while (closestTarget[OwnerKey] !== myCurrentShadowKey && closestTarget[OwnerKey] !== myOwnerKey) {
                closestTarget = parentNodeGetter.call(closestTarget);
            }

            return patchShadowDomTraversalMethods(closestTarget);
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

// This method is for wrapping event listeners bound in the template.
export function getWrappedTemplateListener(vm: VM, fn: EventListener): EventListener {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    return function handler(event: Event) {
        if (isValidEventForCustomElement(event)) {
            patchShadowDomEvent(vm, event);
            invokeEventListener(vm, EventListenerContext.NATIVE_ELEMENT, fn, vm.component, event);
        }
    };
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
