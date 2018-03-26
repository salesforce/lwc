/*
 * Detects property changes by installing setter/getter overrides on the component
 * instance.
 *
 * TODO - in 216 engine will expose an 'updated' callback for services that is invoked
 * once after all property changes occur in the event loop.
 */

import {
    Element,
} from './engine';
import {
    ConfigListenerMetadata,
    ConfigContext,
} from './wiring';

/**
 * Invokes the provided change listeners with the resolved component properties.
 * @param configListenerMetadatas list of config listener metadata (config listeners and their context)
 * @param paramValues values for all wire adapter config params
 */
function invokeConfigListeners(configListenerMetadatas: Set<ConfigListenerMetadata>, paramValues: any) {
    for (const metadata of configListenerMetadatas) {
        const { listener, statics, params } = metadata;

        const resolvedParams = Object.create(null);
        if (params) {
            const keys = Object.keys(params);
            for (let j = 0, jlen = keys.length; j < jlen; j++) {
                const key = keys[j];
                const value = paramValues[params[key]];
                resolvedParams[key] = value;
            }
        }

        // TODO - consider read-only membrane to enforce invariant of immutable config
        const config = Object.assign({}, statics, resolvedParams);
        listener.call(undefined, config);
    }
}

function updated(cmp: Element, prop: string, configContext: ConfigContext) {
    if (!configContext.mutated) {
        configContext.mutated = new Set<string>();
        // collect all prop changes via a microtask
        Promise.resolve().then(updatedFuture.bind(undefined, cmp, configContext));
    }
    configContext.mutated.add(prop);
}

function updatedFuture(cmp: Element, configContext: ConfigContext) {
    const uniqueListeners = new Set<ConfigListenerMetadata>();

    // configContext.mutated must be set prior to invoking this function
    const mutated = configContext.mutated as Set<string>;
    delete configContext.mutated;
    for (const prop of mutated) {
        const value = cmp[prop];
        if (configContext.values[prop] === value) {
            continue;
        }
        configContext.values[prop] = value;
        const listeners = configContext.listeners[prop];
        for (let i = 0, len = listeners.length; i < len; i++) {
            uniqueListeners.add(listeners[i]);
        }
    }
    invokeConfigListeners(uniqueListeners, configContext.values);
}

/**
 * Installs setter override to trap changes to a property, triggering the config listeners.
 * @param cmp The component
 * @param prop The name of the property to be monitored
 * @param context The service context
 */
export function installTrap(cmp: Object, prop: string, configContext: ConfigContext) {
    const callback = updated.bind(undefined, cmp, prop, configContext);
    const newDescriptor = getOverrideDescriptor(cmp, prop, callback);
    Object.defineProperty(cmp, prop, newDescriptor);
}

/**
 * Finds the descriptor of the named property on the prototype chain
 * @param Ctor Constructor function
 * @param propName Name of property to find
 * @param protoSet Prototypes searched (to avoid circular prototype chains)
 */
function findDescriptor(Ctor: any, propName: PropertyKey, protoSet?: any[]): PropertyDescriptor | null {
    protoSet = protoSet || [];
    if (!Ctor || protoSet.indexOf(Ctor) > -1) {
        return null; // null, undefined, or circular prototype definition
    }
    const proto = Object.getPrototypeOf(Ctor);
    if (!proto) {
        return null;
    }
    const descriptor = Object.getOwnPropertyDescriptor(proto, propName);
    if (descriptor) {
        return descriptor;
    }
    protoSet.push(Ctor);
    return findDescriptor(proto, propName, protoSet);
}

/**
 * Gets a property descriptor that monitors the provided property for changes
 * @param cmp The component
 * @param prop The name of the property to be monitored
 * @param callback a function to invoke when the prop's value changes
 * @return A property descriptor
 */
function getOverrideDescriptor(cmp: Object, prop: string, callback: () => void) {
    const descriptor = findDescriptor(cmp, prop);
    let enumerable;
    let get;
    let set;
    // TODO: this does not cover the override of existing descriptors at the instance level
    // and that's ok because eventually we will not need to do any of these :)
    if (descriptor === null || (descriptor.get === undefined && descriptor.set === undefined)) {
        let value = cmp[prop];
        enumerable = true;
        get = function() {
            return value;
        };
        set = function(newValue) {
            value = newValue;
            callback();
        };
    } else {
        const { set: originalSet, get: originalGet } = descriptor;
        enumerable = descriptor.enumerable;
        set = function(newValue) {
            if (originalSet) {
                originalSet.call(cmp, newValue);
            }
            callback();
        };
        get = function() {
            return originalGet ? originalGet.call(cmp) : undefined;
        };
    }
    return {
        set,
        get,
        enumerable,
        configurable: true,
    };
}
