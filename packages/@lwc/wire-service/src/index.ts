/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
 * The @wire service.
 *
 * Provides data binding between wire adapters and LWC components decorated with @wire.
 * Register wire adapters with `register(adapterId: any, adapterFactory: WireAdapterFactory)`.
 */

import assert from './assert';
import { CONTEXT_ID, CONTEXT_CONNECTED, CONTEXT_DISCONNECTED, CONTEXT_UPDATED } from './constants';
import { LightningElement, ElementDef } from './engine';
import {
    NoArgumentListener,
    WireEventTargetListener,
    Context,
    WireContext,
    WireEventTarget,
} from './wiring';
import { ValueChangedEvent } from './value-changed-event';
import { LinkContextEvent } from './link-context-event';

export interface WireEventTarget {
    dispatchEvent(evt: ValueChangedEvent): boolean;
    addEventListener(type: string, listener: WireEventTargetListener): void;
    removeEventListener(type: string, listener: WireEventTargetListener): void;
}

export type WireAdapterFactory = (eventTarget: WireEventTarget) => void;

// wire adapters: wire adapter id => adapter ctor
const adapterFactories: Map<any, WireAdapterFactory> = new Map<any, WireAdapterFactory>();

/**
 * Invokes the specified callbacks.
 * @param listeners functions to call
 */
function invokeListener(listeners: NoArgumentListener[]) {
    for (let i = 0, len = listeners.length; i < len; ++i) {
        listeners[i].call(undefined);
    }
}

/**
 * The wire service.
 *
 * This service is registered with the engine's service API. It connects service
 * callbacks to wire adapter lifecycle events.
 */
const wireService = {
    wiring: (cmp: LightningElement, data: object, def: ElementDef, context: Context) => {
        const wireContext: WireContext = (context[CONTEXT_ID] = Object.create(null));
        wireContext[CONTEXT_CONNECTED] = [];
        wireContext[CONTEXT_DISCONNECTED] = [];
        wireContext[CONTEXT_UPDATED] = { listeners: {}, values: {} };

        // engine guarantees invocation only if def.wire is defined
        const wireStaticDef = def.wire;
        const wireTargets = Object.keys(wireStaticDef);
        for (let i = 0, len = wireTargets.length; i < len; i++) {
            const wireTarget = wireTargets[i];
            const wireDef = wireStaticDef[wireTarget];
            const adapterFactory = adapterFactories.get(wireDef.adapter);

            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(
                    wireDef.adapter,
                    `@wire on "${wireTarget}": adapter id must be truthy`
                );
                assert.isTrue(
                    adapterFactory,
                    `@wire on "${wireTarget}": unknown adapter id: ${String(wireDef.adapter)}`
                );

                // enforce restrictions of reactive parameters
                if (wireDef.params) {
                    Object.keys(wireDef.params).forEach(param => {
                        const prop = wireDef.params![param];
                        const segments = prop.split('.');
                        segments.forEach(segment => {
                            assert.isTrue(
                                segment.length > 0,
                                `@wire on "${wireTarget}": reactive parameters must not be empty`
                            );
                        });
                        assert.isTrue(
                            segments[0] !== wireTarget,
                            `@wire on "${wireTarget}": reactive parameter "${
                                segments[0]
                            }" must not refer to self`
                        );
                        // restriction for dot-notation reactive parameters
                        if (segments.length > 1) {
                            // @wire emits a stream of immutable values. an emit sets the target property; it does not mutate a previously emitted value.
                            // restricting dot-notation reactive parameters to reference other @wire targets makes trapping the 'head' of the parameter
                            // sufficient to observe the value change.
                            assert.isTrue(
                                wireTargets.includes(segments[0]) &&
                                    wireStaticDef[segments[0]].method !== 1,
                                `@wire on "${wireTarget}": dot-notation reactive parameter "${prop}" must refer to a @wire property`
                            );
                        }
                    });
                }
            }

            if (adapterFactory) {
                const wireEventTarget = new WireEventTarget(cmp, def, context, wireDef, wireTarget);
                adapterFactory({
                    dispatchEvent: wireEventTarget.dispatchEvent.bind(wireEventTarget),
                    addEventListener: wireEventTarget.addEventListener.bind(wireEventTarget),
                    removeEventListener: wireEventTarget.removeEventListener.bind(wireEventTarget),
                } as WireEventTarget);
            }
        }
    },

    connected: (cmp: LightningElement, data: object, def: ElementDef, context: Context) => {
        let listeners: NoArgumentListener[];
        if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(
                !def.wire || context[CONTEXT_ID],
                'wire service was not initialized prior to component creation:  "connected" service hook invoked without necessary context'
            );
        }
        if (!def.wire || !(listeners = context[CONTEXT_ID][CONTEXT_CONNECTED])) {
            return;
        }
        invokeListener(listeners);
    },

    disconnected: (cmp: LightningElement, data: object, def: ElementDef, context: Context) => {
        let listeners: NoArgumentListener[];
        if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(
                !def.wire || context[CONTEXT_ID],
                'wire service was not initialized prior to component creation:  "disconnected" service hook invoked without necessary context'
            );
        }
        if (!def.wire || !(listeners = context[CONTEXT_ID][CONTEXT_DISCONNECTED])) {
            return;
        }
        invokeListener(listeners);
    },
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
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(adapterId, 'adapter id must be truthy');
        assert.isTrue(typeof adapterFactory === 'function', 'adapter factory must be a callable');
    }
    adapterFactories.set(adapterId, adapterFactory);
}

export { ValueChangedEvent, LinkContextEvent };
