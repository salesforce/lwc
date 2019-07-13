/**
 * This is a referral implementation for a custom context provider
 * that can be installed on any element in the dom, and can provide
 * value to any LWC component using wire.
 *
 * This provide is sharing the same value with every child, and the
 * identity of the consumer is not tracked.
 */

import { register, ValueChangedEvent, LinkContextEvent } from 'wire-service';

const addEventListener = document.prototype.addEventListener;

const IdentityMetaMap = new WeakMap();
const UniqueEventName = `advanced_context_event_${guid()}`;
const Provider = Symbol('SimpleContextProvider');

function guid() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

register(Provider, eventTarget => {
    let unsubscribeCallback;

    function callback(data, unsubscribe) {
        eventTarget.dispatchEvent(new ValueChangedEvent(data));
        unsubscribeCallback = unsubscribe;
    }

    eventTarget.addEventListener('connect', () => {
        const event = new LinkContextEvent(UniqueEventName, callback);
        eventTarget.dispatchEvent(event);
        if (unsubscribeCallback === undefined) {
            // no provider was found, in which case the default
            // context should be set.
            const defaultContext = null;
            // Note: you might decide to use a global identity instead
            eventTarget.dispatchEvent(new ValueChangedEvent(defaultContext));
        }
    });

    eventTarget.addEventListener('disconnect', () => {
        if (unsubscribeCallback !== undefined) {
            unsubscribeCallback();
            unsubscribeCallback = undefined; // resetting it to support reinsertion
        }
    });
});

function createNewConsumerMeta(provider, callback) {
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
        callback,
        provider,
        value,
    };
    // storing identity into the map
    IdentityMetaMap.set(identity, meta);
    return meta;
}

function disconnectConsumer(eventTarget, consumerMeta) {
    const meta = IdentityMetaMap.get(consumerMeta.identity);
    if (meta !== undefined) {
        // take care of disconnecting everything for this consumer
        // ...
        // then remove the identity from the map
        IdentityMetaMap.delete(consumerMeta.identity);
    } else {
        throw new TypeError(`Invalid context operation in ${eventTarget}.`);
    }
}

function setupNewContextProvider(eventTarget) {
    addEventListener.call(eventTarget, UniqueEventName, event => {
        // this event must have a full stop when it is intercepted by a provider
        event.stopImmediatePropagation();
        // the new child provides a callback as a communication channel
        const { detail: callback } = event;
        // create consumer metadata as soon as it is connected
        const consumerMeta = createNewConsumerMeta(eventTarget, callback);
        // emit the identity value and provide disconnect callback
        callback(consumerMeta.identity, () => disconnectConsumer(eventTarget, consumerMeta));
    });
}

export function installCustomContext(elm) {
    setupNewContextProvider(elm);
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

export { Provider };
