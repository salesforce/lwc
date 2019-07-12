/**
 * This is a referral implementation for a custom context provider
 * that can be installed on any element in the dom, and can provide
 * value to any LWC component using wire.
 *
 * This provide is sharing the same value with every child, and the
 * identity of the consumer is not tracked.
 */

// Per Context Component Instance, track the current context data
import { register, ValueChangedEvent, LinkContextEvent } from 'wire-service';

const ContextValueMap = new WeakMap();
const UniqueEventName = `simple_context_event_${guid()}`;
const Provider = Symbol('SimpleContextProvider');

function guid() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

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

register(Provider, eventTarget => {
    let unsubscribeCallback;

    function callback(value, unsubscribe) {
        eventTarget.dispatchEvent(new ValueChangedEvent(createContextPayload(value)));
        unsubscribeCallback = unsubscribe;
    }

    eventTarget.addEventListener('connect', () => {
        const event = new LinkContextEvent(UniqueEventName, callback);
        eventTarget.dispatchEvent(event);
        if (unsubscribeCallback === undefined) {
            // no provider was found, in which case the default
            // context should be set.
            const defaultContext = getDefaultContext();
            eventTarget.dispatchEvent(new ValueChangedEvent(createContextPayload(defaultContext)));
        }
    });

    eventTarget.addEventListener('disconnect', () => {
        if (unsubscribeCallback !== undefined) {
            unsubscribeCallback();
            unsubscribeCallback = undefined; // resetting it to support reinsertion
        }
    });
});

function getContextData(eventTarget) {
    let contextData = ContextValueMap.get(eventTarget);
    if (contextData === undefined) {
        // collection of consumers' callbacks and default context value per provider instance
        contextData = {
            listeners: [],
            value: getInitialContext(), // initial value for an installed provider
        };
        ContextValueMap.set(eventTarget, contextData);
    }
    return contextData;
}

function disconnectConsumer(eventTarget, contextData, callback) {
    const i = contextData.listeners.indexOf(callback);
    if (i >= 0) {
        contextData.listeners.splice(i, 1);
    } else {
        throw new TypeError(`Invalid context operation in ${eventTarget}.`);
    }
}

function setupNewContextProvider(eventTarget) {
    let contextData; // lazy initialization
    addEventListener.call(eventTarget, UniqueEventName, event => {
        // this event must have a full stop when it is intercepted by a provider
        event.stopImmediatePropagation();
        // the new child provides a callback as a communication channel
        const { detail: callback } = event;
        // once the first consumer gets connected, then we create the contextData object
        if (contextData === undefined) {
            contextData = getContextData(eventTarget);
        }
        // registering the new callback
        contextData.listeners.push(callback);
        // emit the current value and provide disconnect callback
        callback(contextData.value, () => disconnectConsumer(eventTarget, contextData, callback));
    });
}

function emitNewContextValue(eventTarget, newValue) {
    const contextData = getContextData(eventTarget);
    // in this example, all consumers get the same context value
    contextData.value = newValue;
    contextData.listeners.forEach(callback =>
        callback(newValue, () => disconnectConsumer(eventTarget, contextData, callback))
    );
}

export function installCustomContext(node) {
    setupNewContextProvider(node);
}

export function setCustomContext(node, newValue) {
    emitNewContextValue(node, newValue);
}

export { Provider };
