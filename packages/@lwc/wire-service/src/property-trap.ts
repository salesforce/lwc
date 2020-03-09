/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/*
 * Detects property changes by installing setter/getter overrides on the component
 * instance.
 */

import { ConfigListenerMetadata, ConfigContext, ReactiveParameter } from './wiring';

/**
 * Invokes the provided change listeners with the resolved component properties.
 * @param configListenerMetadatas List of config listener metadata (config listeners and their context)
 * @param paramValues Values for all wire adapter config params
 */
function invokeConfigListeners(
    configListenerMetadatas: Set<ConfigListenerMetadata>,
    paramValues: any
) {
    configListenerMetadatas.forEach(metadata => {
        const { listener, statics, reactives } = metadata;

        const reactiveValues = Object.create(null);
        if (reactives) {
            const keys = Object.keys(reactives);
            for (let j = 0, jlen = keys.length; j < jlen; j++) {
                const key = keys[j];
                const value = paramValues[reactives[key]];
                reactiveValues[key] = value;
            }
        }

        // TODO [#1634]: consider read-only membrane to enforce invariant of immutable config
        const config = Object.assign({}, statics, reactiveValues);
        listener.call(undefined, config);
    });
}

/**
 * Marks a reactive parameter as having changed.
 * @param cmp The component
 * @param reactiveParameters Reactive parameters that has changed
 * @param configContext The service context
 */
export function updated(
    cmp: EventTarget,
    reactiveParameters: Array<ReactiveParameter>,
    configContext: ConfigContext
) {
    if (!configContext.mutated) {
        configContext.mutated = new Set<ReactiveParameter>(reactiveParameters);
        // collect all prop changes via a microtask
        Promise.resolve().then(updatedFuture.bind(undefined, cmp, configContext));
    } else {
        for (let i = 0, n = reactiveParameters.length; i < n; i++) {
            configContext.mutated.add(reactiveParameters[i]);
        }
    }
}

function updatedFuture(cmp: EventTarget, configContext: ConfigContext) {
    const uniqueListeners = new Set<ConfigListenerMetadata>();

    // configContext.mutated must be set prior to invoking this function
    const mutated = configContext.mutated as Set<ReactiveParameter>;
    delete configContext.mutated;

    mutated.forEach(reactiveParameter => {
        const value = getReactiveParameterValue(cmp, reactiveParameter);
        if (configContext.values[reactiveParameter.reference] === value) {
            return;
        }
        configContext.values[reactiveParameter.reference] = value;

        const listeners = configContext.listeners[reactiveParameter.head];
        for (let i = 0, len = listeners.length; i < len; i++) {
            uniqueListeners.add(listeners[i]);
        }
    });

    invokeConfigListeners(uniqueListeners, configContext.values);
}

/**
 * Gets the value of an @wire reactive parameter.
 * @param cmp The component
 * @param reactiveParameter The parameter to get
 */
export function getReactiveParameterValue(
    cmp: EventTarget,
    reactiveParameter: ReactiveParameter
): any {
    let value = (cmp as any)[reactiveParameter.head];
    if (!reactiveParameter.tail) {
        return value;
    }

    const segments = reactiveParameter.tail;
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
 * @param reactiveParametersHead The common head of the reactiveParameters
 * @param reactiveParameters Reactive parameters with the same head, that defines the property to monitor
 * @param configContext The service context
 */
export function installTrap(
    cmp: EventTarget,
    reactiveParametersHead: string,
    reactiveParameters: Array<ReactiveParameter>,
    configContext: ConfigContext
) {
    const callback = updated.bind(undefined, cmp, reactiveParameters, configContext);
    const newDescriptor = getOverrideDescriptor(cmp, reactiveParametersHead, callback);
    Object.defineProperty(cmp, reactiveParametersHead, newDescriptor);
}

/**
 * Finds the descriptor of the named property on the prototype chain
 * @param target The target instance/constructor function
 * @param propName Name of property to find
 * @param protoSet Prototypes searched (to avoid circular prototype chains)
 */
export function findDescriptor(
    target: any,
    propName: PropertyKey,
    protoSet?: any[]
): PropertyDescriptor | null {
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
function getOverrideDescriptor(cmp: EventTarget, prop: string, callback: () => void) {
    const descriptor = findDescriptor(cmp, prop);
    let enumerable;
    let get;
    let set;
    // This does not cover the override of existing descriptors at the instance level
    // and that's ok because eventually we will not need to do any of these :)
    if (descriptor === null || (descriptor.get === undefined && descriptor.set === undefined)) {
        let value = (cmp as any)[prop];
        enumerable = true;
        get = function() {
            return value;
        };
        set = function(newValue: any) {
            value = newValue;
            callback();
        };
    } else {
        const { set: originalSet, get: originalGet } = descriptor;
        enumerable = descriptor.enumerable;
        set = function(newValue: any) {
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
