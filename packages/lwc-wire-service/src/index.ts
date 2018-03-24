/**
 * The @wire service.
 *
 * Provides data binding between wire adapters and LWC components decorated with @wire.
 * Register wire adapters with `register(adapterId: any, adapterFactory: WireAdapterFactory)`.
 */

import { Element } from 'engine';
import assert from './assert';
import {
    CONTEXT_ID,
    CONTEXT_CONNECTED,
    CONTEXT_DISCONNECTED,
    CONTEXT_UPDATED
} from './constants';
import {
    ElementDef,
    NoArgumentListener,
    WireEventTargetCallback,
    Context,
    WireContext,
    WireEventTarget,
    ValueChangedEvent,
} from './wiring';

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
    wiring: (cmp: Element, data: object, def: ElementDef, context: Context) => {
        const wireContext: WireContext = context[CONTEXT_ID] = Object.create(null);
        wireContext[CONTEXT_CONNECTED] = [];
        wireContext[CONTEXT_DISCONNECTED] = [];
        wireContext[CONTEXT_UPDATED] = Object.create(null);

        // engine guarantees invocation only if def.wire is defined
        const wireStaticDef = def.wire;
        const wireTargets = Object.keys(wireStaticDef);
        for (let i = 0, len = wireTargets.length; i < len; i++) {
            const wireTarget = wireTargets[i];
            const wireDef = wireStaticDef[wireTarget];
            const id = wireDef.adapter;
            const wireEventTarget = new WireEventTarget(cmp, def, context, wireDef, wireTarget);
            const adapterFactory = adapterFactories.get(id);
            if (adapterFactory) {
                adapterFactory({
                    dispatchEvent: wireEventTarget.dispatchEvent.bind(wireEventTarget),
                    addEventListener: wireEventTarget.addEventListener.bind(wireEventTarget),
                    removeEventListener: wireEventTarget.removeEventListener.bind(wireEventTarget)
                } as WireEventTarget);
            }
        }
    },

    connected: (cmp: Element, data: object, def: ElementDef, context: Context) => {
        let callbacks: NoArgumentListener[];
        if (!def.wire || !(callbacks = context[CONTEXT_ID][CONTEXT_CONNECTED])) {
            return;
        }
        invokeCallback(callbacks);
    },

    disconnected: (cmp: Element, data: object, def: ElementDef, context: Context) => {
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

export { ValueChangedEvent } from './wiring';
