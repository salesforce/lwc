import assert from "./assert";
import {
    addEventListener,
    removeEventListener,
    getRootNode,
} from "./dom";
import { VM } from "./vm";
import { isFalse, ArraySplice, ArrayIndexOf, create, ArrayPush, isUndefined, isFunction } from "./language";
import { isRendering, vmBeingRendered, invokeComponentEventListenerCallback } from "./invoker";
import { pierce } from "./piercing";
import { invokeCustomElementEventCallback } from "./invoker";

export interface CustomElementEventListenerContext {
    isRoot: boolean;
}

const rootEventListeners: WeakMap<EventListener, EventListener> = new WeakMap();

function getWrappedRootListener(vm: VM, listener: EventListener): EventListener {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }

    if (!isFunction(listener)) {
        return listener; // ignoring non-callable arguments
    }
    let wrappedListener = rootEventListeners.get(listener);
    if (isUndefined(wrappedListener)) {
        wrappedListener = function(event: Event) {
            // * if the event is dispatched directly on the host, it is not observable from root
            // * if the event is dispatched in an element that does not belongs to the shadow and it is not composed,
            //   it is not observable from the root
            if (event.target === event.currentTarget || (isFalse((event as any).composed) && getRootNode.call(event.target) !== event.currentTarget)) {
                return;
            }
            const e = pierce(vm, event);
            invokeCustomElementEventCallback(vm, listener, [e]);
        };
        rootEventListeners.set(listener, wrappedListener);
    }
    return wrappedListener;
}

const cmpEventListeners: WeakMap<EventListener, EventListener> = new WeakMap();

function getWrappedComponentsListener(vm: VM, listener: EventListener) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }

    let wrappedListener = cmpEventListeners.get(listener);
    if (isUndefined(wrappedListener)) {
        wrappedListener = function(event: Event) {
            // * if the event is dispatched directly on the host, it is observable from the custom element
            if (event.target === event.currentTarget || getRootNode.call(event.target) === event.currentTarget) {
                const e = pierce(vm, event);
                invokeComponentEventListenerCallback(vm, event.type, listener, [e]);
            }
        };
        cmpEventListeners.set(listener, wrappedListener);
    }
    return wrappedListener;
}

function executeEventHandlers(evt: Event, handlers: EventListener[]) {
    const { length: handlersLength } = handlers;
    let stopped: boolean = false;
    const oldStopImmediatePropagation = evt.stopImmediatePropagation;
    evt.stopImmediatePropagation = function () {
        stopped = true;
        oldStopImmediatePropagation.call(this);
    };
    for (let i = 0; i < handlersLength; i += 1) {
        // all handlers on the custom element should be called with undefined 'this'
        handlers[i].call(undefined, evt);
        if (stopped) {
            break;
        }
    }
}

function createElementEventListener(vm: VM, type: string) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }

    return function (this: Event, evt: Event) {
        const rootEvents = vm.rootEvents && vm.rootEvents[type];
        if (rootEvents) {
            executeEventHandlers(evt, rootEvents);
        }

        const cmpEvents = vm.cmpEvents && vm.cmpEvents[type];
        if (cmpEvents) {
            executeEventHandlers(evt, cmpEvents);
        }
    }
}

export function addCmpEventListener(vm: VM, type: string, listener: EventListener, options: any) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm} by adding an event listener for "${type}".`);
        assert.invariant(isFunction(listener), `Invalid second argument for this.template.addEventListener() in ${vm} for event "${type}". Expected an EventListener but received ${listener}.`);
    }
    const wrappedListener = getWrappedComponentsListener(vm, listener);
    let { cmpEvents, cmpListeners } = vm;
    if (isUndefined(cmpEvents)) {
        cmpEvents = vm.cmpEvents = create(null) as Record<string, EventListener[]>;
    }
    if (isUndefined(cmpListeners)) {
        cmpListeners = vm.cmpListeners = create(null) as Record<string, EventListener>;
    }
    let domListener = cmpListeners[type];
    if (isUndefined(domListener)) {
        domListener = cmpListeners[type] = createElementEventListener(vm, type);
        addEventListener.call(vm.elm, type, domListener, options);
    }

    let cmpEventHandlers = cmpEvents[type];
    if (isUndefined(cmpEventHandlers)) {
        cmpEventHandlers = cmpEvents[type] = [];
    }

    if (ArrayIndexOf.call(cmpEventHandlers, wrappedListener) !== -1) {
        assert.logWarning(`${vm} has duplicate listeners for event "${type}". Instead add the event listener in the connectedCallback() hook.`);
    }
    ArrayPush.call(cmpEventHandlers, wrappedListener);
}

export function addRootEventListener(vm: VM, type: string, listener: EventListener, options: any) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm} by adding an event listener for "${type}".`);
        assert.invariant(isFunction(listener), `Invalid second argument for this.template.addEventListener() in ${vm} for event "${type}". Expected an EventListener but received ${listener}.`);
    }
    const wrappedListener = getWrappedRootListener(vm, listener);
    let { rootEvents, cmpListeners } = vm;
    if (isUndefined(rootEvents)) {
        vm.rootEvents = rootEvents = create(null) as Record<string, EventListener[]>;
    }
    if (isUndefined(cmpListeners)) {
        vm.cmpListeners = cmpListeners = create(null) as Record<string, EventListener>;
    }
    let domListener = cmpListeners[type];
    if (isUndefined(domListener)) {
        domListener = cmpListeners[type] = createElementEventListener(vm, type);
        addEventListener.call(vm.elm, type, domListener, options);
    }

    let rootEventHandlers = rootEvents[type];
    if (isUndefined(rootEventHandlers)) {
        rootEventHandlers = rootEvents[type] = [];
    }

    if (ArrayIndexOf.call(rootEventHandlers, wrappedListener) !== -1) {
        assert.logWarning(`${vm} has duplicate listeners for event "${type}". Instead add the event listener in the connectedCallback() hook.`);
    }
    ArrayPush.call(rootEventHandlers, wrappedListener);
}

export function removeRootEventListener(vm: VM, type: string, listener: EventListener, options: any) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    const wrappedListener = getWrappedRootListener(vm, listener);
    let { rootEvents } = vm;
    if (isUndefined(rootEvents)) {
        vm.rootEvents = rootEvents = create(null) as Record<string, EventListener[]>;
    }
    if (isUndefined(rootEvents[type])) {
        rootEvents[type] = [];
    }
    if (isUndefined(rootEvents) || isUndefined(rootEvents[type]) || ArrayIndexOf.call(rootEvents[type], wrappedListener) === -1) {
        assert.logError(`Did not find event listener ${wrappedListener} for event "${type}" on ${vm}. This is probably a typo or a life cycle mismatch. Make sure that you add the right event listeners in the connectedCallback() hook and remove them in the disconnectedCallback() hook.`);
    }
    const eventsList = rootEvents[type];
    ArraySplice.call(eventsList, ArrayIndexOf.call(eventsList, wrappedListener), 1);
    removeEventFromCustomElement(vm, type, options);
}

export function removeCmpEventListener(vm: VM, type: string, listener: EventListener, options: any) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    const wrappedListener = getWrappedComponentsListener(vm, listener);
    let { cmpEvents } = vm;
    if (isUndefined(cmpEvents)) {
        vm.cmpEvents = cmpEvents = create(null) as Record<string, EventListener[]>;
    }
    if (isUndefined(cmpEvents[type])) {
        cmpEvents[type] = [];
    }
    if (isUndefined(cmpEvents) || isUndefined(cmpEvents[type]) || ArrayIndexOf.call(cmpEvents[type], wrappedListener) === -1) {
        assert.logError(`Did not find event listener ${wrappedListener} for event "${type}" on ${vm}. This is probably a typo or a life cycle mismatch. Make sure that you add the right event listeners in the connectedCallback() hook and remove them in the disconnectedCallback() hook.`);
    }
    const eventsList = cmpEvents[type];
    ArraySplice.call(eventsList, ArrayIndexOf.call(eventsList, wrappedListener), 1);
    removeEventFromCustomElement(vm, type, options);
}

function removeEventFromCustomElement(vm: VM, type: string, options: any) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    let { cmpEvents, rootEvents, cmpListeners } = vm;
    if (isUndefined(cmpEvents)) {
        vm.cmpEvents = cmpEvents = create(null) as Record<string, EventListener[]>;
    }
    if (isUndefined(rootEvents)) {
        vm.rootEvents = rootEvents = create(null) as Record<string, EventListener[]>;
    }

    let cmpTypeEvents = cmpEvents[type]
    if (isUndefined(cmpTypeEvents)) {
        cmpTypeEvents = cmpEvents[type] = [] as EventListener[];
    }

    let rootTypeEvents = rootEvents[type]
    if (isUndefined(rootTypeEvents)) {
        rootTypeEvents = rootEvents[type] = [] as EventListener[];
    }

    if (cmpTypeEvents.length === 0 && rootTypeEvents.length === 0 && (cmpListeners && cmpListeners[type])) {
        removeEventListener.call(vm.elm, type, cmpListeners[type], options);
        cmpListeners[type] = undefined;
    }
}
