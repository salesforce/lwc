/**
 * The @wire service.
 *
 * Provides data binding between wire adapters and LWC components decorated with @wire.
 * Register wire adapters with `register(adapterId: any, adapterFactory: WireAdapterFactory)`.
 */

import { Element, ComposableEvent } from 'engine';
import assert from './assert';
import {
    CONTEXT_ID,
    CONNECTEDCALLBACK,
    DISCONNECTEDCALLBACK,
    UPDATED,
    CONNECT,
    DISCONNECT,
    CONFIG
} from './constants';
import {
    updated,
    installSetterOverrides,
    removeCallback,
    removeUpdatedCallbackConfigs
} from './wiring';

export interface WireDef {
    params?: {
        [key: string]: string;
    };
    static?: {
        [key: string]: any;
    };
    adapter: any;
    method?: 1;
}
export interface ElementDef {
    wire: { // TODO - wire is optional but all wire service code assumes it's present
        [key: string]: WireDef
    };
}
export type NoArgumentCallback = () => void;
export type UpdatedCallback = (object) => void;
export interface UpdatedCallbackConfig {
    updatedCallback: UpdatedCallback;
    statics?: {
        [key: string]: any;
    };
    params?: {
        [key: string]: string;
    };
}
export interface ServiceUpdateContext {
    [prop: string]: UpdatedCallbackConfig[];
}
export type ServiceContext = Set<NoArgumentCallback> | ServiceUpdateContext;

export type WireEventTargetCallback = NoArgumentCallback | UpdatedCallback;
export interface ValueChagnedEvent extends ComposableEvent {
    value: any;
}
export interface WireEventTarget {
    dispatchEvent(evt: ValueChagnedEvent): boolean;
    addEventListener(type: string, callback: WireEventTargetCallback): void;
    removeEventListener(type: string, callback: WireEventTargetCallback): void;
}

export type WireAdapterFactory = (eventTarget: WireEventTarget) => void;

// wire adapters: wire adapter id => adapter ctor
const adapterFactories: Map<any, WireAdapterFactory> = new Map<any, WireAdapterFactory>();

/**
 * Invokes the specified callbacks.
 * @param callbacks functions to call
 */
function invokeCallback(callbacks: NoArgumentCallback[]) {
    for (let i = 0, len = callbacks.length; i < len; ++i) {
        callbacks[i].call(undefined);
    }
}

/**
 * The wire service.
 *
 * This service is registered with the engine's service API. It connects service
 * callbacks to wire adapter lifecycle callbacks.
 */
const wireService = {
    // TODO W-4072588 - support connected + disconnected (repeated) cycles
    wiring: (cmp: Element, data: object, def: ElementDef, context: object) => {
        const wireContext = context[CONTEXT_ID] = Object.create(null);
        wireContext[CONNECTEDCALLBACK] = new Set<NoArgumentCallback>();
        wireContext[DISCONNECTEDCALLBACK] = new Set<NoArgumentCallback>();
        wireContext[UPDATED] = Object.create(null);

        // engine guarantees invocation only if def.wire is defined
        const wireStaticDef = def.wire;
        const wireTargets = Object.keys(wireStaticDef);
        for (let i = 0, len = wireTargets.length; i < len; i++) {
            const wireTarget = wireTargets[i];
            const wireDef = wireStaticDef[wireTarget];
            const id = wireDef.adapter;
            const params = wireDef.params;

            const wireEventTarget: WireEventTarget = {
                addEventListener: (type, callback) => {
                    const connectedCallbacks = context[CONTEXT_ID][CONNECTEDCALLBACK];
                    const disconnectedCallbacks = context[CONTEXT_ID][DISCONNECTEDCALLBACK];
                    const serviceUpdateContext = context[CONTEXT_ID][UPDATED];
                    switch (type) {
                        case CONNECT:
                            assert.isFalse(connectedCallbacks.has(callback), 'must not call addEventListener("connected") with the same callback');
                            connectedCallbacks.add(callback);
                            break;
                        case DISCONNECT:
                            assert.isFalse(disconnectedCallbacks.has(callback), 'must not call addEventListener("disconnected") with the same callback');
                            disconnectedCallbacks.add(callback);
                            break;
                        case CONFIG:
                            const updatedCallbackConfig: UpdatedCallbackConfig = {
                                updatedCallback: callback,
                                statics: wireDef.static,
                                params: wireDef.params
                            };

                            if (params) {
                                Object.keys(params).forEach(param => {
                                    const prop = params[param];
                                    let updatedCallbackConfigs = serviceUpdateContext[prop];
                                    if (!updatedCallbackConfigs) {
                                        updatedCallbackConfigs = [updatedCallbackConfig];
                                        serviceUpdateContext[prop] = updatedCallbackConfigs;
                                        installSetterOverrides(cmp, prop, updated.bind(undefined, cmp, prop, def, context));
                                    } else {
                                        updatedCallbackConfigs.push(updatedCallbackConfig);
                                    }
                                });
                            }
                            break;
                        case 'default':
                            throw new Error(`unsupported event type ${type}`);
                    }
                },
                removeEventListener: (type, callback) => {
                    const connectedCallbacks = context[CONTEXT_ID][CONNECTEDCALLBACK];
                    const disconnectedCallbacks = context[CONTEXT_ID][DISCONNECTEDCALLBACK];
                    const serviceUpdateContext = context[CONTEXT_ID][UPDATED];
                    switch (type) {
                        case CONNECT:
                            removeCallback(connectedCallbacks, callback);
                            break;
                        case DISCONNECT:
                            removeCallback(disconnectedCallbacks, callback);
                            break;
                        case CONFIG:
                            if (params) {
                                Object.keys(params).forEach(param => {
                                    const prop = params[param];
                                    const updatedCallbackConfigs = serviceUpdateContext[prop];
                                    if (updatedCallbackConfigs) {
                                        removeUpdatedCallbackConfigs(updatedCallbackConfigs, callback);
                                    }
                                });
                            }
                            break;
                        case 'default':
                            throw new Error(`unsupported event type ${type}`);
                    }
                },
                dispatchEvent: (evt) => {
                    if (evt instanceof ValueChangedEvent) {
                        const value = evt.value;
                        if (wireDef.method) {
                            cmp[wireTarget](value);
                        } else {
                            cmp[wireTarget] = value;
                        }
                        return false; // canceling signal since we don't want this to propagate
                    } else {
                        throw new Error(`Invalid event ${evt}.`);
                    }
                }
            };

            const adapterFactory = adapterFactories.get(id);
            if (adapterFactory) {
                adapterFactory(wireEventTarget);
            }
        }
    },

    connected: (cmp: Element, data: object, def: ElementDef, context: object) => {
        let callbacks: NoArgumentCallback[];
        if (!def.wire || !(callbacks = context[CONTEXT_ID][CONNECTEDCALLBACK])) {
            return;
        }
        invokeCallback(callbacks);
    },

    disconnected: (cmp: Element, data: object, def: ElementDef, context: object) => {
        let callbacks: NoArgumentCallback[];
        if (!def.wire || !(callbacks = context[CONTEXT_ID][DISCONNECTEDCALLBACK])) {
            return;
        }
        invokeCallback(callbacks);
    }
};

/**
 * Registers the wire service.
 */
export function registerWireService(registerService: Function) {
    registerService(wireService);
}

/**
 * Registers a wire adapter.
 */
export function register(adapterId: any, adapterFactory: WireAdapterFactory) {
    assert.isTrue(adapterId, 'adapter id must be truthy');
    assert.isTrue(typeof adapterFactory === 'function', 'adapter factory must be a callable');
    adapterFactories.set(adapterId, adapterFactory);
}

/*
 * Unregisters an adapter, only available for non prod (e.g. test util)
 */
export function unregister(adapterId: any) {
    if (process.env.NODE_ENV !== 'production') {
        adapterFactories.delete(adapterId);
    }
}

export class ValueChangedEvent {
    value: any;
    type: string;
    constructor(value) {
        this.type = 'ValueChangedEvent';
        this.value = value;
    }
}
