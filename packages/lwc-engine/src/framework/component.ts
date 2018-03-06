import assert from "./assert";
import {
    invokeComponentConstructor,
    invokeComponentRenderMethod,
    isRendering,
    vmBeingRendered,
    invokeComponentCallback,
} from "./invoker";
import { isArray, isUndefined, create, ArrayPush, ArrayIndexOf, ArraySplice } from "./language";
import { invokeServiceHook, Services } from "./services";
import { pierce } from "./piercing";
import { getComponentDef, PropsDef, WireHash, TrackDef, ViewModelReflection } from './def';
import { VM } from "./vm";
import { VNodes } from "../3rdparty/snabbdom/types";

import { Template } from "./template";
import { ShadowRoot } from "./root";
import { EmptyObject } from "./utils";
export type ErrorCallback = (error: any, stack: string) => void;
export interface Component {
    [ViewModelReflection]: VM;
    readonly classList: DOMTokenList;
    readonly root: ShadowRoot;
    render?: () => void | Template;
    connectedCallback?: () => void;
    disconnectedCallback?: () => void;
    renderedCallback?: () => void;
    errorCallback?: ErrorCallback;
    [key: string]: any;
}

// TODO: review this with the compiler output
export interface ComponentConstructor {
    new (): Component;
    readonly name: string;
    readonly forceTagName?: keyof HTMLElementTagNameMap;
    readonly publicMethods?: string[];
    readonly publicProps?: PropsDef;
    readonly track?: TrackDef;
    readonly wire?: WireHash;
    readonly labels?: string[];
    readonly templateUsedProps?: string[];
    // support for circular
    <T>(): T;
    readonly __circular__?: any;
}

export let vmBeingConstructed: VM | null = null;
export function isBeingConstructed(vm: VM): boolean {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    return vmBeingConstructed === vm;
}

export function createComponent(vm: VM, Ctor: ComponentConstructor) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    // create the component instance
    const vmBeingConstructedInception = vmBeingConstructed;
    vmBeingConstructed = vm;

    const component = invokeComponentConstructor(vm, Ctor);
    vmBeingConstructed = vmBeingConstructedInception;

    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm.component === component, `Invalid construction for ${vm}, maybe you are missing the call to super() on classes extending Element.`);
        const { track } = getComponentDef(Ctor);
        if ('state' in component && (!track || !track.state)) {
            assert.logWarning(`Non-trackable component state detected in ${component}. Updates to state property will not be reactive. To make state reactive, add @track decorator.`);
        }
    }
}

export function linkComponent(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    // wiring service
    const { def: { wire } } = vm;
    if (wire) {
        const { wiring } = Services;
        if (wiring) {
            invokeServiceHook(vm, wiring);
        }
    }
}

export function clearReactiveListeners(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    const { deps } = vm;
    const len = deps.length;
    if (len) {
        for (let i = 0; i < len; i += 1) {
            const set = deps[i];
            const pos = ArrayIndexOf.call(deps[i], vm);
            if (process.env.NODE_ENV !== 'production') {
                assert.invariant(pos > -1, `when clearing up deps, the vm must be part of the collection.`);
            }
            ArraySplice.call(set, pos, 1);
        }
        deps.length = 0;
    }
}

function createComponentListener(vm: VM): EventListener {
    return function handler(event: Event) {
        handleComponentEvent(vm, event);
    };
}

export function addComponentEventListener(vm: VM, eventName: string, newHandler: EventListener) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm} by adding a new event listener for "${eventName}".`);
    }
    let { cmpEvents, cmpListener } = vm;
    if (isUndefined(cmpEvents)) {
        // this piece of code must be in sync with modules/component-events
        vm.cmpEvents = cmpEvents = create(null) as Record<string, EventListener[]>;
        vm.cmpListener = cmpListener = createComponentListener(vm);
    }
    if (isUndefined(cmpEvents[eventName])) {
        cmpEvents[eventName] = [];
        const { elm } = vm;
        elm.addEventListener(eventName, cmpListener as EventListener, false);
    }

    if (process.env.NODE_ENV !== 'production') {
        if (cmpEvents[eventName] && ArrayIndexOf.call(cmpEvents[eventName], newHandler) !== -1) {
            assert.logWarning(`${vm} has duplicate listeners for event "${eventName}". Instead add the event listener in the connectedCallback() hook.`);
        }
    }

    ArrayPush.call(cmpEvents[eventName], newHandler);
}

export function removeComponentEventListener(vm: VM, eventName: string, oldHandler: EventListener) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the state of ${vm} by removing an event listener for "${eventName}".`);
    }
    const { cmpEvents, elm } = vm;
    if (cmpEvents) {
        const handlers = cmpEvents[eventName];
        const pos = handlers && ArrayIndexOf.call(handlers, oldHandler);
        if (handlers && pos > -1) {
            if (handlers.length === 1) {
                elm.removeEventListener(eventName, (vm.cmpListener as EventListener));
                (cmpEvents as any)[eventName] = undefined;
            } else {
                ArraySplice.call(cmpEvents[eventName], pos, 1);
            }
            return;
        }
    }
    if (process.env.NODE_ENV !== 'production') {
        assert.logWarning(`Did not find event listener ${oldHandler} for event "${eventName}" on ${vm}. Instead only remove an event listener once.`);
    }
}

function handleComponentEvent(vm: VM, event: Event) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.invariant(event instanceof Event, `dispatchComponentEvent() must receive an event instead of ${event}`);
        const eventType = event.type;
        const cmpEvt = vm.cmpEvents;
        const cmpEventsType = cmpEvt && cmpEvt[eventType];
        assert.invariant(vm.cmpEvents && !isUndefined(cmpEventsType) && cmpEventsType.length, `handleComponentEvent() should only be invoked if there is at least one listener in queue for ${event.type} on ${vm}.`);
    }

    const { cmpEvents = EmptyObject } = vm;
    const { type, stopImmediatePropagation } = event;
    const handlers = cmpEvents[type];
    if (isArray(handlers)) {
        let uninterrupted = true;
        event.stopImmediatePropagation = function() {
            uninterrupted = false;
            stopImmediatePropagation.call(event);
        };
        const e = pierce(vm, event);
        for (let i = 0, len = handlers.length; uninterrupted && i < len; i += 1) {
            invokeComponentCallback(vm, handlers[i], [e]);
        }
        // restoring original methods
        event.stopImmediatePropagation = stopImmediatePropagation;
    }
}

export function renderComponent(vm: VM): VNodes {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.invariant(vm.isDirty, `${vm} is not dirty.`);
    }

    clearReactiveListeners(vm);
    const vnodes = invokeComponentRenderMethod(vm);
    vm.isDirty = false;

    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isArray(vnodes), `${vm}.render() should always return an array of vnodes instead of ${vnodes}`);
    }
    return vnodes;
}

export function markComponentAsDirty(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.isFalse(vm.isDirty, `markComponentAsDirty() for ${vm} should not be called when the component is already dirty.`);
        assert.isFalse(isRendering, `markComponentAsDirty() for ${vm} cannot be called during rendering of ${vmBeingRendered}.`);
    }
    vm.isDirty = true;
}

export function getCustomElementComponent(elmOrRoot: HTMLElement | ShadowRoot): Component {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(elmOrRoot[ViewModelReflection]);
    }
    return (elmOrRoot[ViewModelReflection] as VM).component as Component;
}
