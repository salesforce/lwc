/**
 * This is a referral implementation for a custom context provider
 * that can be installed on any element in the dom, and can provide
 * value to any LWC component using wire.
 *
 * This provide is sharing the same value with every child, and the
 * identity of the consumer is not tracked.
 */
import { createContextProvider } from 'lwc';

const ContextValueMap = new WeakMap();

function getDefaultContext() {
    return 'missing';
}

function getInitialContext() {
    return 'pending';
}

function createContextPayload(value) {
    // here you can decide to use the protocol { data, error }
    // or just provide the value, or maybe creating a readonly
    // proxy.
    return value;
}

export class WireAdapter {
    contextValue = getDefaultContext();
    constructor(dataCallback) {
        this._dataCallback = dataCallback;
        // provides the default wired value based on the default context value
        this._dataCallback(createContextPayload(this.contextValue));
    }
    update(_config, context) {
        if (context) {
            // we only care about the context, no config is expected or used
            if (!context.hasOwnProperty('value')) {
                throw new Error(`Invalid context provided`);
            }
            this.contextValue = context.value;
            this._dataCallback(createContextPayload(this.contextValue));
        }
    }
    connect() {
        // noop
    }
    disconnect() {
        // noop
    }
    static configSchema = {};
    static contextSchema = { value: 'required' /* could be 'optional' */ };
}

function getContextData(eventTarget) {
    let contextData = ContextValueMap.get(eventTarget);
    if (contextData === undefined) {
        // collection of consumers and default context value per provider instance
        contextData = {
            consumers: [],
            value: getInitialContext(), // initial value for an installed provider
        };
        ContextValueMap.set(eventTarget, contextData);
    }
    return contextData;
}

const contextualizer = createContextProvider(WireAdapter);

export function installCustomContext(target) {
    contextualizer(target, {
        consumerConnectedCallback(consumer) {
            // once the first consumer gets connected, then we create the contextData object
            const contextData = getContextData(target);
            // registering the new consumer
            contextData.consumers.push(consumer);
            // push the current value
            consumer.provide({ value: contextData.value });
        },
        consumerDisconnectedCallback(consumer) {
            const contextData = getContextData(target);
            const i = contextData.consumers.indexOf(consumer);
            if (i >= 0) {
                contextData.consumers.splice(i, 1);
            } else {
                throw new TypeError(`Invalid context operation in ${target}.`);
            }
        },
    });
}

export function setCustomContext(target, newValue) {
    const contextData = getContextData(target);
    // in this example, all consumers get the same context value
    contextData.value = newValue;
    contextData.consumers.forEach(consumer => consumer.provide({ value: newValue }));
}
