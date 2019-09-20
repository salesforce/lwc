/**
 * This is a referral implementation for a custom context provider
 * that can be installed on any element in the dom, and can provide
 * value to any LWC component using wire.
 *
 * This provide is sharing the same value with every child, and the
 * identity of the consumer is not tracked.
 */
import { createContextProvider } from 'lwc';

const IdentityMetaMap = new WeakMap();
const ConsumerMetaMap = new WeakMap();

export class WireAdapter {
    // no provider was found, in which case the default
    // context should be set.
    contextValue = null;

    constructor(dataCallback) {
        this._dataCallback = dataCallback;
        // Note: you might also use a global identity in constructors
        this._dataCallback(this.contextValue);
    }
    update(_config, context) {
        if (context) {
            // we only care about the context, no config is expected or used
            if (!context.hasOwnProperty('value')) {
                throw new Error(`Invalid context provided`);
            }
            this.contextValue = context.value;
            this._dataCallback(this.contextValue);
        }
    }
    connect() {
        // noop
    }
    disconnect() {
        // noop
    }
    static contextSchema = { value: 'required' /* could be 'optional' */ };
}

function createNewConsumerMeta(consumer) {
    // identity must be an object that can't be proxified otherwise we
    // loose the identity when tracking the value.
    const identity = Object.freeze(_ => {
        throw new Error(`Invalid Invocation`);
    });
    // default value is undefined
    const value = undefined;
    // this object is what we can get to via the weak map by using the identity as a key
    const meta = {
        identity,
        consumer,
        value,
    };
    // storing identity into the map
    IdentityMetaMap.set(identity, meta);
    ConsumerMetaMap.set(consumer, meta);
    return meta;
}

function decommissionConsumer(consumer) {
    const meta = ConsumerMetaMap.get(consumer);
    if (meta === undefined) {
        // this should never happen unless you decommission consumers
        // manually without waiting for the disconnect to occur.
        throw new TypeError(`Invalid context operation.`);
    }
    // take care of disconnecting everything for this consumer
    // ...
    // then remove the identity and consumer from maps
    IdentityMetaMap.delete(meta.identity);
    ConsumerMetaMap.delete(consumer.identity);
}

const contextualizer = createContextProvider(WireAdapter);

export function installCustomContext(target) {
    // Note: the identity of the consumer is already bound to the target.
    contextualizer(target, {
        consumerConnectedCallback(consumer) {
            // create consumer metadata as soon as it is connected
            const consumerMeta = createNewConsumerMeta(target, consumer);
            // emit the identity value
            consumer.provide({ value: consumerMeta.identity });
        },
        consumerDisconnectedCallback(consumer) {
            decommissionConsumer(consumer);
        },
    });
}

export function setValueForIdentity(identity, value) {
    const meta = IdentityMetaMap.get(identity);
    if (meta !== undefined) {
        return (meta.value = value);
    } else {
        throw new Error(`Invalid identity`);
    }
}

export function getValueForIdentity(identity) {
    const meta = IdentityMetaMap.get(identity);
    return meta.value;
}
