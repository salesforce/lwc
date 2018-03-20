/**
 * The @wire service.
 *
 * Provides data binding between wire adapters and LWC components decorated with @wire.
 * Register wire adapters with `register(adapterId: any, adapterFactory: WireAdapterFactory)`.
 */

import { Element } from 'engine';
import assert from './assert';
import {
    WireDef,
    ElementDef,
    NoArgumentCallback,
    UpdatedCallback,
    UpdatedCallbackConfig
} from './shared-types';
import {
    CONTEXT_ID,
    CONNECTED,
    DISCONNECTED
} from './constants';
import {
    updated,
    getPropsFromParams,
    installSetterOverrides,
    buildContext
} from './wiring';
export interface WiredValue {
    data?: any;
    error?: any;
}
export type TargetSetter = (WiredValue) => void;

export type WireAdapterCallback = UpdatedCallback | NoArgumentCallback;
export interface WireAdapter {
    updatedCallback?: UpdatedCallback;
    connectedCallback?: NoArgumentCallback;
    disconnectedCallback?: NoArgumentCallback;
}
export type WireAdapterFactory = (targetSetter: TargetSetter) => WireAdapter;

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
        const wireDefs: WireDef[] = [];
        const updatedCallbackKey = 'updatedCallback';
        const updatedCallbackConfigs: UpdatedCallbackConfig[] = [];
        const connectedNoArgCallbacks: NoArgumentCallback[] = [];
        const disconnectedNoArgCallbacks: NoArgumentCallback[] = [];
        for (let i = 0; i < wireTargets.length; i++) {
            const wireTarget = wireTargets[i];
            const wireDef = wireStaticDef[wireTarget];
            wireDefs.push(wireDef);
            const id = wireDef.adapter || wireDef.type;

            // initialize wired property
            if (!wireDef.method) {
                cmp[wireTarget] = {};
            }

            const targetSetter: TargetSetter = wireDef.method ?
                (value) => { cmp[wireTarget](value); } :
                (value) => { Object.assign(cmp[wireTarget], value); };

            const adapterFactory = adapterFactories.get(id);
            if (adapterFactory) {
                const wireAdapter = adapterFactory(targetSetter);
                adapters.push(wireAdapter);
                const connectedCallback = wireAdapter[CONNECTED];
                if (connectedCallback) {
                    connectedNoArgCallbacks.push(connectedCallback);
                }
                const disconnectedCallback = wireAdapter[DISCONNECTED];
                if (disconnectedCallback) {
                    disconnectedNoArgCallbacks.push(disconnectedCallback);
                }
                const updatedCallback = wireAdapter[updatedCallbackKey];
                if (updatedCallback) {
                    updatedCallbackConfigs.push({
                        updatedCallback,
                        statics: wireDef.static,
                        params: wireDef.params
                    });
                }
            }
        }

        // only add updated to bound props
        const props = getPropsFromParams(wireDefs);
        props.forEach((prop) => {
            installSetterOverrides(cmp, prop, updated.bind(undefined, cmp, data, def, context));
        });

        // cache context that optimizes runtime of service callbacks
        context[CONTEXT_ID] = buildContext(connectedNoArgCallbacks, disconnectedNoArgCallbacks, updatedCallbackConfigs, props);
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
