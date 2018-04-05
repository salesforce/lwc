import assert from "./assert";
import {
    invokeComponentConstructor,
    invokeComponentRenderMethod,
    isRendering,
    vmBeingRendered,
    invokeComponentCallback,
} from "./invoker";
import { isArray, isUndefined, create, ArrayPush, ArrayIndexOf, ArraySplice } from "./language";
import { pierce } from "./piercing";
import { getComponentDef, PropsDef, WireHash, TrackDef, ViewModelReflection } from './def';
import { VM } from "./vm";
import { VNodes } from "../3rdparty/snabbdom/types";

import { Template } from "./template";
import { ShadowRoot, isChildOfRoot } from "./root";
import { EmptyObject } from "./utils";
import { addEventListener, removeEventListener, getRootNode } from "./dom";
import {
    WIRE_CONTEXT_ID,
    CONTEXT_CONNECTED,
    CONTEXT_DISCONNECTED,
    CONTEXT_UPDATED,
    WireDef,
    WireContext,
    ConfigContext,
    ConfigListenerMetadata,
    WireEventTarget,
    ValueChangedEvent,
    WireEventTargetListener
} from "./wiring";
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

export interface WireEventTarget {
    dispatchEvent(evt: ValueChangedEvent): boolean;
    addEventListener(type: string, listener: WireEventTargetListener): void;
    removeEventListener(type: string, listener: WireEventTargetListener): void;
}

export type WireAdapterFactory = (eventTarget: WireEventTarget) => void;

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

// wire adapters: wire adapter id => adapter ctor
const adapterFactories: Map<any, WireAdapterFactory> = new Map<any, WireAdapterFactory>();

/**
 * Registers a wire adapter.
 */
export function register(adapterId: any, adapterFactory: WireAdapterFactory) {
    assert.isTrue(adapterId, 'adapter id must be truthy');
    assert.isTrue(typeof adapterFactory === 'function', 'adapter factory must be a callable');
    adapterFactories.set(adapterId, adapterFactory);
}

export function createWireContext(vm: VM) {
    const { def: { wire }, context } = vm;
    if (!context[WIRE_CONTEXT_ID]) {
        const wireContext: WireContext = context[WIRE_CONTEXT_ID] = Object.create(null);
        wireContext[CONTEXT_CONNECTED] = [];
        wireContext[CONTEXT_DISCONNECTED] = [];
        wireContext[CONTEXT_UPDATED] = {};
        const wireTargets = Object.keys(wire as WireHash);

        // TODO: initialize with default value
        vm.wireValues = {};
        for (let i = 0, len = wireTargets.length; i < len; i++) {
            const wireTarget = wireTargets[i];
            const wireDef = (wire as WireHash)[wireTarget];
            const adapterFactory = adapterFactories.get(wireDef.adapter);
            if (adapterFactory) {
                const wireEventTarget = new WireEventTarget(vm, context, wireDef as WireDef, wireTarget);
                adapterFactory({
                    dispatchEvent: wireEventTarget.dispatchEvent.bind(wireEventTarget),
                    addEventListener: wireEventTarget.addEventListener.bind(wireEventTarget),
                    removeEventListener: wireEventTarget.removeEventListener.bind(wireEventTarget)
                } as WireEventTarget);
            }
        }
    }
}

export function componentUpdated(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }

    const { def: { wire }, context } = vm;
    if (wire) {
        createWireContext(vm);

        const configContext = context[WIRE_CONTEXT_ID][CONTEXT_UPDATED];

        // collect all prop changes via a microtask
        Promise.resolve().then(updatedFuture.bind(undefined, configContext, vm.component as Component));
    }
}

function updatedFuture(configContext: ConfigContext, cmp: Component) {
    const uniqueListeners = new Set<ConfigListenerMetadata>();
    Object.keys(configContext).forEach(prop => {
        const listeners = configContext[prop];
        for (let i = 0, len = listeners.length; i < len; i++) {
            uniqueListeners.add(listeners[i]);
        }
    });
    invokeConfigListeners(uniqueListeners, cmp);
}

/**
 * Invokes the provided change listeners with the resolved component properties.
 * @param configListenerMetadatas list of config listener metadata (config listeners and their context)
 * @param paramValues values for all wire adapter config params
 */
function invokeConfigListeners(configListenerMetadatas: Set<ConfigListenerMetadata>, cmp: Component) {
    configListenerMetadatas.forEach((metadata) => {
        const { listener, statics, params } = metadata;

        const resolvedParams = Object.create(null);
        if (params) {
            Object.keys(params).forEach(param => {
                resolvedParams[param] = cmp[params[param]];
            });
        }

        // TODO - consider read-only membrane to enforce invariant of immutable config
        const config = Object.assign({}, statics, resolvedParams);
        listener.call(undefined, config);
    });
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
        addEventListener.call(elm, eventName, cmpListener as EventListener, false);
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
                removeEventListener.call(elm, eventName, (vm.cmpListener as EventListener));
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

export function isValidEvent(event: Event): boolean {
    // TODO: this is only needed if ShadowDOM is not used
    if ((event as any).composed === true) {
        return true;
    }
    // if the closest root contains the currentTarget, the event is valid
    return isChildOfRoot(getRootNode.call(event.target), event.currentTarget as Node);
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
    if (!isValidEvent(event)) {
        return;
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
