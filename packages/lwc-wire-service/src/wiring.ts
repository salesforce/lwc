import { Element } from 'engine';
import {
    ElementDef,
    WireEventTargetCallback,
    ConfigListener,
    ParamToConfigListenerMetadataMap,
    ConfigListenerMetadata
} from './index';
import {
    CONTEXT_ID,
    CONTEXT_UPDATED
} from './constants';

/**
 * Invokes the provided change listeners with the resolved component properties.
 * @param configListenerMetadatas list of config listener metadata (config listeners and their context)
 * @param paramValues values for all wire adapter config params
 */
function invokeConfigListeners(configListenerMetadatas: ConfigListenerMetadata[], paramValues: any) {
    for (let i = 0, len = configListenerMetadatas.length; i < len; ++i) {
        const { callback, statics, params } = configListenerMetadatas[i];

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
        callback.call(undefined, config);
    }
}

/**
 * TODO - in early 216, engine will expose an `updated` callback for services that
 * is invoked whenever a tracked property is changed. wire service is structured to
 * make this adoption trivial.
 */
export function updated(cmp: Element, data: object, def: ElementDef, context: object) {
    let paramToConfigListenerMetadatas: ParamToConfigListenerMetadataMap;
    if (!def.wire || !(paramToConfigListenerMetadatas = context[CONTEXT_ID][CONTEXT_UPDATED])) {
        return;
    }

    const updateProp = data.toString();
    const paramValue = {};
    paramValue[updateProp] = cmp[updateProp];

    // TODO - must debounce multiple param changes so listeners are invoked only once

    // process queue of impacted adapters
    invokeConfigListeners(paramToConfigListenerMetadatas[updateProp], paramValue);
}

/**
 * Gets a property descriptor that monitors the provided property for changes
 * @param cmp The component
 * @param prop The name of the property to be monitored
 * @param callback a function to invoke when the prop's value changes
 */
export function installSetterOverrides(cmp: Object, prop: string, callback: Function) {
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
export function getOverrideDescriptor(cmp: Object, prop: string, callback: () => void) {
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

export function removeCallback(callbacks: WireEventTargetCallback[], toRemove: WireEventTargetCallback) {
    for (let i = 0, l = callbacks.length; i < l; i++) {
        if (callbacks[i] === toRemove) {
            callbacks.splice(i, 1);
            return;
        }
    }
}

export function removeConfigListener(configListenerMetadatas: ConfigListenerMetadata[], toRemove: ConfigListener) {
    for (let i = 0, len = configListenerMetadatas.length; i < len; i++) {
        if (configListenerMetadatas[i].callback === toRemove) {
            configListenerMetadatas.splice(i, 1);
            return;
        }
    }
}
