/**
 * The @wire service.
 *
 * Provides data binding between wire adapters and LWC components decorated with @wire.
 * Register wire adapters with `register(adapterId: any, adapterFactory: WireAdapterFactory)`.
 */

import { Element } from 'engine';
import assert from './assert';
import {
    ElementDef,
    NoArgumentCallback,
    UpdatedCallback,
    UpdatedCallbackConfig,
    ServiceUpdateContext
} from './shared-types';
import {
    CONTEXT_ID,
    CONNECTED,
    DISCONNECTED,
    UPDATEDCALLBACK
} from './constants';
import {
    updated,
    installSetterOverrides,
    buildContext
} from './wiring';

export type TargetSetter = (wiredValue: any) => void;
export interface EventTarget {
    dispatchEvent(evt: Event): boolean;
}
export type WireAdapterCallback = UpdatedCallback | NoArgumentCallback;
export interface WireAdapter {
    updatedCallback?: UpdatedCallback;
    connectedCallback?: NoArgumentCallback;
    disconnectedCallback?: NoArgumentCallback;
}
export type WireAdapterFactory = (targetSetter: TargetSetter, eventTarget: EventTarget) => WireAdapter;

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
        // engine guarantees invocation only if def.wire is defined
        const wireStaticDef = def.wire;
        const wireTargets = Object.keys(wireStaticDef);
        const adapters: WireAdapter[] = [];

        const connectedNoArgCallbacks: NoArgumentCallback[] = [];
        const disconnectedNoArgCallbacks: NoArgumentCallback[] = [];
        const serviceUpdateContext: ServiceUpdateContext = Object.create(null);
        for (let i = 0; i < wireTargets.length; i++) {
            const wireTarget = wireTargets[i];
            const wireDef = wireStaticDef[wireTarget];
            const id = wireDef.adapter;
            const params = wireDef.params;

            const targetSetter: TargetSetter = wireDef.method ?
                (value) => { cmp[wireTarget](value); } :
                (value) => { cmp[wireTarget] = value; };

            const eventTarget: EventTarget = {
                dispatchEvent: cmp.dispatchEvent.bind(cmp)
            };

            const adapterFactory = adapterFactories.get(id);
            if (adapterFactory) {
                const wireAdapter = adapterFactory(targetSetter, eventTarget);
                adapters.push(wireAdapter);
                const connectedCallback = wireAdapter[CONNECTED];
                if (connectedCallback) {
                    connectedNoArgCallbacks.push(connectedCallback);
                }
                const disconnectedCallback = wireAdapter[DISCONNECTED];
                if (disconnectedCallback) {
                    disconnectedNoArgCallbacks.push(disconnectedCallback);
                }
                const updatedCallback = wireAdapter[UPDATEDCALLBACK];
                if (updatedCallback) {
                    const updatedCallbackConfig: UpdatedCallbackConfig = {
                        updatedCallback,
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
                            } else {
                                updatedCallbackConfigs.push(updatedCallbackConfig);
                            }
                        });
                    }
                }
            }
        }

        // only add updated to bound props
        Object.keys(serviceUpdateContext).forEach((prop) => {
            // using data to notify which prop gets updated
            installSetterOverrides(cmp, prop, updated.bind(undefined, cmp, prop, def, context));
        });

        // cache context that optimizes runtime of service callbacks
        context[CONTEXT_ID] = buildContext(connectedNoArgCallbacks, disconnectedNoArgCallbacks, serviceUpdateContext);
    },

    connected: (cmp: Element, data: object, def: ElementDef, context: object) => {
        let callbacks: NoArgumentCallback[];
        if (!def.wire || !(callbacks = context[CONTEXT_ID][CONNECTED])) {
            return;
        }
        invokeCallback(callbacks);
    },

    disconnected: (cmp: Element, data: object, def: ElementDef, context: object) => {
        let callbacks: NoArgumentCallback[];
        if (!def.wire || !(callbacks = context[CONTEXT_ID][DISCONNECTED])) {
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
    assert.isTrue(typeof adapterFactory === 'function', 'adapter factory must be a function');
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
