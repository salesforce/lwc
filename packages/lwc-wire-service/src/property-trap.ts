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
    ParamDefinition,
} from './wiring';

/**
 * Invokes the provided change listeners with the resolved component properties.
 * @param configListenerMetadatas List of config listener metadata (config listeners and their context)
 * @param paramValues Values for all wire adapter config params
 */
function invokeConfigListeners(configListenerMetadatas: Set<ConfigListenerMetadata>, paramValues: any) {
    configListenerMetadatas.forEach((metadata) => {
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
    });
}

function updated(cmp: Element, paramDefn: ParamDefinition, configContext: ConfigContext) {
    if (!configContext.mutated) {
        configContext.mutated = new Set<ParamDefinition>();
        // collect all prop changes via a microtask
        Promise.resolve().then(updatedFuture.bind(undefined, cmp, configContext));
    }
    configContext.mutated.add(paramDefn);
}

function updatedFuture(cmp: Element, configContext: ConfigContext) {
    const uniqueListeners = new Set<ConfigListenerMetadata>();

    // configContext.mutated must be set prior to invoking this function
    const mutated = configContext.mutated as Set<ParamDefinition>;
    delete configContext.mutated;
    mutated.forEach(paramDefn => {
        const value = getParamValue(cmp, paramDefn);
        if (configContext.values[paramDefn.full] === value) {
            return;
        }
        configContext.values[paramDefn.full] = value;
        const listeners = configContext.listeners[paramDefn.root];
        for (let i = 0, len = listeners.length; i < len; i++) {
            uniqueListeners.add(listeners[i]);
        }
    });
    invokeConfigListeners(uniqueListeners, configContext.values);
}

/**
 * Gets the value of a wire parameter.
 * @param cmp The component
 * @param paramDefn The parameter to get
 */
export function getParamValue(cmp: Element, paramDefn: ParamDefinition): any {
    let value: any = cmp[paramDefn.root];
    if (!paramDefn.remainder) {
        return value;
    }

    const segments = paramDefn.remainder;
    for (let i = 0, len = segments.length; i < len && value != null; i++) {
        const segment = segments[i];
        if (typeof value !== 'object' || !(segment in value)) {
            return undefined;
        }
        value = value[segment];
    }
    return value;
}

/**
 * Installs setter override to trap changes to a property, triggering the config listeners.
 * @param cmp The component
 * @param paramDefn Parameter defining the property to be monitored
 * @param context The service context
 */
export function installTrap(cmp: Object, paramDefn: ParamDefinition, configContext: ConfigContext) {
    const callback = updated.bind(undefined, cmp, paramDefn, configContext);
    const newDescriptor = getOverrideDescriptor(cmp, paramDefn.root, callback);
    Object.defineProperty(cmp, paramDefn.root, newDescriptor);
}

/**
 * Finds the descriptor of the named property on the prototype chain
 * @param target The target instance/constructor function
 * @param propName Name of property to find
 * @param protoSet Prototypes searched (to avoid circular prototype chains)
 */
export function findDescriptor(target: any, propName: PropertyKey, protoSet?: any[]): PropertyDescriptor | null {
    protoSet = protoSet || [];
    if (!target || protoSet.indexOf(target) > -1) {
        return null; // null, undefined, or circular prototype definition
    }
    const descriptor = Object.getOwnPropertyDescriptor(target, propName);
    if (descriptor) {
        return descriptor;
    }
    const proto = Object.getPrototypeOf(target);
    if (!proto) {
        return null;
    }
    protoSet.push(target);
    return findDescriptor(proto, propName, protoSet);
}

/**
 * Gets a property descriptor that monitors the provided property for changes
 * @param cmp The component
 * @param prop The name of the property to be monitored
 * @param callback A function to invoke when the prop's value changes
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
