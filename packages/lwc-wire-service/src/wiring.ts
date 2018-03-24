import { Element } from 'engine';
import {
    ElementDef,
    WireEventTargetCallback,
    UpdatedCallbackConfig,
    ServiceUpdateContext,
    UpdatedCallback
} from './index';
import {
    CONTEXT_ID,
    UPDATED
} from './constants';

/**
 * Invokes the provided updated callbacks with the resolved component properties.
 * @param ucMetadatas wire updated service context metadata
 * @param paramValues values for all wire adapter config params
 */
function invokeUpdatedCallback(ucMetadatas: UpdatedCallbackConfig[], paramValues: any) {
    for (let i = 0, len = ucMetadatas.length; i < len; ++i) {
        const { updatedCallback, statics, params } = ucMetadatas[i];

        const resolvedParams = Object.create(null);
        if (params) {
            const keys = Object.keys(params);
            for (let j = 0, jlen = keys.length; j < jlen; j++) {
                const key = keys[j];
                const value = paramValues[params[key]];
                resolvedParams[key] = value;
            }
        }

        const config = Object.assign({}, statics, resolvedParams);
        updatedCallback.call(undefined, config);
    }
}

/**
 * TODO - in early 216, engine will expose an `updated` callback for services that
 * is invoked whenever a tracked property is changed. wire service is structured to
 * make this adoption trivial.
 */
export function updated(cmp: Element, data: object, def: ElementDef, context: object) {
    let ucMetadata: ServiceUpdateContext;
    if (!def.wire || !(ucMetadata = context[CONTEXT_ID][UPDATED])) {
        return;
    }

    const updateProp = data.toString();
    const paramValue = {};
    paramValue[updateProp] = cmp[updateProp];

    // process queue of impacted adapters
    invokeUpdatedCallback(ucMetadata[updateProp], paramValue);
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
export function getOverrideDescriptor(cmp: Object, prop: string, callback: Function) {
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

export function removeUpdatedCallbackConfigs(updatedCallbackConfigs: UpdatedCallbackConfig[], toRemove: UpdatedCallback) {
    for (let i = 0, l = updatedCallbackConfigs.length; i < l; i++) {
        if (updatedCallbackConfigs[i].updatedCallback === toRemove) {
            updatedCallbackConfigs.splice(i, 1);
            return;
        }
    }
}
