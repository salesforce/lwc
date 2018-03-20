import { Element } from 'engine';
import {
    ElementDef,
    NoArgumentCallback,
    UpdatedCallbackConfig,
    ServiceUpdateContext,
    ServiceContext
} from './shared-types';
import {
    CONTEXT_ID,
    UPDATED,
    CONNECTED,
    DISCONNECTED
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

        const config = Object.assign(Object.create(null), statics, resolvedParams);
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
    const paramValue = Object.create(null);
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

/**
 * Gets a property descriptor that monitors the provided property for changes
 * @param cmp The component
 * @param prop The name of the property to be monitored
 * @param callback a function to invoke when the prop's value changes
 * @return A property descriptor
 */
export function getOverrideDescriptor(cmp: Object, prop: string, callback: Function) {
    const originalDescriptor = Object.getOwnPropertyDescriptor(cmp.constructor.prototype, prop);
    let newDescriptor;
    if (originalDescriptor) {
        newDescriptor = Object.assign({}, originalDescriptor, {
            set(value) {
                if (originalDescriptor.set) {
                    originalDescriptor.set.call(cmp, value);
                }
                callback();
            }
        });
    } else {
        const propSymbol = Symbol(prop);
        newDescriptor = {
            get() {
                return cmp[propSymbol];
            },
            set(value) {
                cmp[propSymbol] = value;
                callback();
            }
        };
        // grab the existing value
        cmp[propSymbol] = cmp[prop];
    }
    return newDescriptor;
}

/**
 * Builds wire service context to optimize runtime lifecycle callbacks
 * @param connectedNoArgCallbacks wire adapter connected callbacks
 * @param disconnectedNoArgCallbacks wire adapter disconnected callbacks
 * @param updatedCallbackConfigs wire service context metadata with wire adapter updated callbacks
 * @param props bound properties
 * @returns A wire service context
 */
export function buildContext(
    connectedNoArgCallbacks: NoArgumentCallback[],
    disconnectedNoArgCallbacks: NoArgumentCallback[],
    serviceUpdateContext: ServiceUpdateContext
): Map<string, ServiceContext> {
    // cache context that optimizes runtime of service callbacks
    const wireContext: Map<string, ServiceContext> = Object.create(null);
    if (connectedNoArgCallbacks.length > 0) {
        wireContext[CONNECTED] = connectedNoArgCallbacks;
    }

    if (disconnectedNoArgCallbacks.length > 0) {
        wireContext[DISCONNECTED] = disconnectedNoArgCallbacks;
    }

    if (serviceUpdateContext) {
        wireContext[UPDATED] = serviceUpdateContext;
    }

    return wireContext;
}
