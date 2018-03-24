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
    CONTEXT_CONNECTED,
    CONTEXT_DISCONNECTED,
    CONTEXT_UPDATED,
    CONNECT,
    DISCONNECT,
    CONFIG
} from './constants';
import {
    updated,
    installSetterOverrides,
    removeCallback,
    removeConfigListener
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
    // wire is optional on ElementDef but the engine guarantees it before invoking wiring service hook
    wire: {
        [key: string]: WireDef
    };
}
export type NoArgumentListener = () => void;
export type ConfigListener = (object) => void;
export interface ConfigListenerMetadata {
    callback: ConfigListener;
    statics?: {
        [key: string]: any;
    };
    params?: {
        [key: string]: string;
    };
}
// map of param to list of config listeners
// when a param changes O(1) lookup to list of config listeners to notify
export interface ParamToConfigListenerMetadataMap {
    [prop: string]: ConfigListenerMetadata[];
}

export type WireEventTargetCallback = NoArgumentListener | ConfigListener;
export interface ValueChangedEvent extends ComposableEvent {
    value: any;
}
export interface WireEventTarget {
    dispatchEvent(evt: ValueChangedEvent): boolean;
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
function invokeCallback(callbacks: NoArgumentListener[]) {
    for (let i = 0, len = callbacks.length; i < len; ++i) {
        callbacks[i].call(undefined);
    }
}

/**
 * The wire service.
 *
 * This service is registered with the engine's service API. It connects service
 * callbacks to wire adapter lifecycle events.
 */
const wireService = {
    wiring: (cmp: Element, data: object, def: ElementDef, context: object) => {
        const wireContext = context[CONTEXT_ID] = Object.create(null);
        wireContext[CONTEXT_CONNECTED] = new Set<NoArgumentListener>();
        wireContext[CONTEXT_DISCONNECTED] = new Set<NoArgumentListener>();
        wireContext[CONTEXT_UPDATED] = Object.create(null) as ParamToConfigListenerMetadataMap;

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
                    switch (type) {
                        case CONNECT:
                            const connectedCallbacks: Set<WireEventTargetCallback> = context[CONTEXT_ID][CONTEXT_CONNECTED];
                            assert.isFalse(connectedCallbacks.has(callback), 'must not call addEventListener("connect") with the same callback');
                            connectedCallbacks.add(callback);
                            break;
                        case DISCONNECT:
                            const disconnectedCallbacks: Set<WireEventTargetCallback> = context[CONTEXT_ID][CONTEXT_DISCONNECTED];
                            assert.isFalse(disconnectedCallbacks.has(callback), 'must not call addEventListener("disconnect") with the same callback');
                            disconnectedCallbacks.add(callback);
                            break;
                        case CONFIG:
                            const paramToConfigListenerMetadata: ParamToConfigListenerMetadataMap = context[CONTEXT_ID][CONTEXT_UPDATED];
                            const configListenerMetadata: ConfigListenerMetadata = {
                                callback,
                                statics: wireDef.static,
                                params: wireDef.params
                            };

                            if (params) {
                                Object.keys(params).forEach(param => {
                                    const prop = params[param];
                                    let configListenerMetadatas = paramToConfigListenerMetadata[prop];
                                    if (!configListenerMetadatas) {
                                        configListenerMetadatas = [configListenerMetadata];
                                        paramToConfigListenerMetadata[prop] = configListenerMetadatas;
                                        installSetterOverrides(cmp, prop, updated.bind(undefined, cmp, prop, def, context));
                                    } else {
                                        configListenerMetadatas.push(configListenerMetadata);
                                    }
                                });
                            }
                            break;
                        case 'default':
                            throw new Error(`unsupported event type ${type}`);
                    }
                },
                removeEventListener: (type, callback) => {
                    switch (type) {
                        case CONNECT:
                            const connectedCallbacks = context[CONTEXT_ID][CONTEXT_CONNECTED];
                            removeCallback(connectedCallbacks, callback);
                            break;
                        case DISCONNECT:
                            const disconnectedCallbacks = context[CONTEXT_ID][CONTEXT_DISCONNECTED];
                            removeCallback(disconnectedCallbacks, callback);
                            break;
                        case CONFIG:
                            const paramToConfigListenerMetadata: ParamToConfigListenerMetadataMap = context[CONTEXT_ID][CONTEXT_UPDATED];
                            if (params) {
                                Object.keys(params).forEach(param => {
                                    const prop = params[param];
                                    const updatedCallbackConfigs = paramToConfigListenerMetadata[prop];
                                    if (updatedCallbackConfigs) {
                                        removeConfigListener(updatedCallbackConfigs, callback);
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
        let callbacks: NoArgumentListener[];
        if (!def.wire || !(callbacks = context[CONTEXT_ID][CONTEXT_CONNECTED])) {
            return;
        }
        invokeCallback(callbacks);
    },

    disconnected: (cmp: Element, data: object, def: ElementDef, context: object) => {
        let callbacks: NoArgumentListener[];
        if (!def.wire || !(callbacks = context[CONTEXT_ID][CONTEXT_DISCONNECTED])) {
            return;
        }
        invokeCallback(callbacks);
    }
};

/**
 * Registers the wire service.
 */
export function registerWireService(registerService: (object) => void) {
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

/**
 * Unregisters an adapter, only available for non prod (e.g. test util)
 */
export function unregister(adapterId: any) {
    if (process.env.NODE_ENV !== 'production') {
        adapterFactories.delete(adapterId);
    }
}

/**
 * Event fired by wire adapters to emit a new value.
 */
export class ValueChangedEvent {
    value: any;
    type: string;
    constructor(value) {
        this.type = 'ValueChangedEvent';
        this.value = value;
    }
}
