/**
 * The @wire service.
 *
 * Provides data binding between wire adapters and LWC components decorated with @wire.
 * Register wire adapters with `register(adapterId: any, adapterFactory: WireAdapterFactory)`.
 */

import { Element } from 'engine';
import assert from './assert';
import { ElementDef } from './shared-types';

export interface WiredValue {
    data?: any;
    error?: any;
};
export type TargetSetter = (WiredValue) => void;
export type UpdatedCallback = (object) => void;
export type NoArgumentCallback = () => void;
export type WireAdapterCallback = UpdatedCallback | NoArgumentCallback;
export interface WireAdapter {
    updatedCallback?: UpdatedCallback;
    connectedCallback?: NoArgumentCallback;
    disconnectedCallback?: NoArgumentCallback;
};
export type WireAdapterFactory = (targetSetter: TargetSetter) => WireAdapter;

// lifecycle hooks of wire adapters
const HOOKS: Array<keyof WireAdapter> = ['updatedCallback', 'connectedCallback', 'disconnectedCallback'];

// wire adapters: wire adapter id => adapter ctor
const ADAPTERS: Map<any, WireAdapterFactory> = new Map<any, WireAdapterFactory>();

// key for engine service context store
const CONTEXT_ID: string = '@wire';

/**
 * Invokes the specified callbacks with specified arguments.
 */
function invokeCallback(callbacks: WireAdapterCallback[], arg: object|undefined) {
    for (let i = 0, len = callbacks.length; i < len; ++i) {
        callbacks[i].apply(undefined, arg);
    }
}

/**
 * The wire service.
 *
 * This is registered service with the engine's service API. It delegates
 * lifecycle callbacks to relevant wire adapter lifecycle callbacks.
 */
const wireService = {
    // TODO W-4072588 - support connected + disconnected (repeated) cycles
    wiring: (cmp: Element, data: object, def: ElementDef, context: object) => {
        // engine guarantees invocation only if def.wire is defined
        const adapters = installWireAdapters(cmp, def);

        // collect all adapters' callbacks into arrays for future invocation
        let contextData = Object.create(null);
        for (let i = 0; i < HOOKS.length; i++) {
            let hook = HOOKS[i];
            let callbacks: Array<WireAdapterCallback> = [];
            for (let j = 0; j < adapters.length; j++) {
                let callback = adapters[j][hook];
                if (callback) {
                    callbacks.push(callback);
                }
            }
            if (callbacks.length > 0) {
                contextData[hook] = callbacks;
            }
        }
        context[CONTEXT_ID] = contextData;
    },

    connected: (cmp: Element, data: object, def: ElementDef, context: object) => {
        let callbacks : WireAdapterCallback[];
        if (!def.wire || !(callbacks = context[CONTEXT_ID]['connectedCallback'])) {
            return;
        }
        invokeCallback(callbacks, undefined);
    },

    disconnected: (cmp: Element, data: object, def: ElementDef, context: object) => {
        let callbacks;
        if (!def.wire || (callbacks = context[CONTEXT_ID]['disconnectedCallback']) ) {
            return;
        }
        invokeCallback(callbacks, undefined);
    }
};


/**
 * Registers the wire service.
 */
export function registerWireService(register: Function) {
    register(wireService);
}

/**
 * Registers a wire adapter.
 */
export function register(adapterId: any, adapterFactory: WireAdapterFactory) {
    assert.isTrue(adapterId, 'adapter id must be truthy');
    assert.isTrue(typeof adapterFactory === 'function', 'adapter factory must be a function');
    ADAPTERS.set(adapterId, adapterFactory);
};
