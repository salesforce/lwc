/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Context protocol, ported from engine-core + engine-dom. A context PROVIDER is
 * installed on a DOM element for a given wire adapter; a CONSUMER (an
 * `@wire(Adapter)` field) dispatches a bubbling/composed CustomEvent (keyed on a
 * per-adapter token) on connect. The nearest ancestor provider catches it,
 * subscribes, and pushes context values to the consumer.
 */

type ContextValue = unknown;
interface SubscriptionPayload {
    setNewContext(newContext: ContextValue): boolean;
    setDisconnectedCallback?(cb: () => void): void;
}
type SubscriptionCallback = (payload: SubscriptionPayload) => boolean;

interface ContextProviderOptions {
    consumerConnectedCallback: (consumer: { provide(v: ContextValue): void }) => void;
    consumerDisconnectedCallback?: (consumer: { provide(v: ContextValue): void }) => void;
}

let guidCounter = 1;
function guid(): string {
    // Math.random is unavailable in some envs here; a counter is unique enough.
    return `lwc-ctx-${guidCounter++}`;
}

// adapter constructor -> its unique context token (the CustomEvent type).
const adapterToTokenMap = new Map<unknown, string>();

/** The token registered for an adapter, if it has a context provider. */
export function getAdapterContextToken(adapter: unknown): string | undefined {
    return adapterToTokenMap.get(adapter);
}

class WireContextSubscriptionEvent extends CustomEvent<undefined> {
    readonly setNewContext: (newContext: ContextValue) => boolean;
    readonly setDisconnectedCallback?: (cb: () => void) => void;
    constructor(adapterToken: string, payload: SubscriptionPayload) {
        super(adapterToken, { bubbles: true, composed: true });
        this.setNewContext = payload.setNewContext;
        this.setDisconnectedCallback = payload.setDisconnectedCallback;
    }
}

/** Provider side: listen for consumer subscription events on `elm`. */
function registerContextProvider(
    elm: EventTarget,
    adapterContextToken: string,
    onContextSubscription: SubscriptionCallback
): void {
    elm.addEventListener(adapterContextToken, ((evt: WireContextSubscriptionEvent) => {
        const { setNewContext, setDisconnectedCallback } = evt;
        if (onContextSubscription({ setNewContext, setDisconnectedCallback })) {
            evt.stopImmediatePropagation();
        }
    }) as EventListener);
}

/** Consumer side: dispatch a subscription event that bubbles to a provider. */
export function registerContextConsumer(
    elm: EventTarget,
    adapterContextToken: string,
    payload: SubscriptionPayload
): void {
    elm.dispatchEvent(new WireContextSubscriptionEvent(adapterContextToken, payload));
}

/** `createContextProvider(adapter)` → install fn placeable on any element. */
export function createContextProvider(
    adapter: unknown
): (elmOrComponent: EventTarget, options: ContextProviderOptions) => void {
    if (adapterToTokenMap.has(adapter)) {
        throw new Error(`Adapter already has a context provider.`);
    }
    const adapterContextToken = guid();
    adapterToTokenMap.set(adapter, adapterContextToken);
    const providers = new WeakSet<EventTarget>();

    return (elmOrComponent: EventTarget, options: ContextProviderOptions) => {
        if (providers.has(elmOrComponent)) {
            throw new Error(`Adapter was already installed on ${String(elmOrComponent)}.`);
        }
        providers.add(elmOrComponent);
        const { consumerConnectedCallback, consumerDisconnectedCallback } = options;

        registerContextProvider(elmOrComponent, adapterContextToken, (sub) => {
            const { setNewContext, setDisconnectedCallback } = sub;
            const consumer = {
                provide(newContext: ContextValue) {
                    setNewContext(newContext);
                },
            };
            const disconnectCallback = () => {
                consumerDisconnectedCallback?.(consumer);
            };
            setDisconnectedCallback?.(disconnectCallback);
            consumerConnectedCallback(consumer);
            return true;
        });
    };
}
