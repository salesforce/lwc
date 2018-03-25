import assert from './assert';
import {
    CONTEXT_ID,
    CONTEXT_CONNECTED,
    CONTEXT_DISCONNECTED,
    CONTEXT_UPDATED,
    CONNECT,
    DISCONNECT,
    CONFIG
} from './constants';

import {
    Element,
    ElementDef,
    WireDef
} from './engine';

export type NoArgumentListener = () => void;
export type ConfigListener = (object) => void;
export interface ConfigListenerMetadata {
    callback: ConfigListener;
    statics?: {
        [key: string]: any;
    };
    params?: {
        [key: string]: string;
    };
}
// map of param to list of config listeners
// when a param changes O(1) lookup to list of config listeners to notify
export interface ParamToConfigListenerMetadataMap {
    [prop: string]: ConfigListenerMetadata[];
}

export interface WireContext {
    [CONTEXT_CONNECTED]: NoArgumentListener[];
    [CONTEXT_DISCONNECTED]: NoArgumentListener[];
    [CONTEXT_UPDATED]: ParamToConfigListenerMetadataMap;
}

export interface Context {
    [CONTEXT_ID]: WireContext;
}

export type WireEventTargetCallback = NoArgumentListener | ConfigListener;

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
function updated(cmp: Element, data: object, def: ElementDef, context: object) {
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
export function installSetterOverrides(cmp: Object, prop: string, callback: () => void) {
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

function removeCallback(callbacks: WireEventTargetCallback[], toRemove: WireEventTargetCallback) {
    for (let i = 0, l = callbacks.length; i < l; i++) {
        if (callbacks[i] === toRemove) {
            callbacks.splice(i, 1);
            return;
        }
    }
}

function removeConfigListener(configListenerMetadatas: ConfigListenerMetadata[], toRemove: ConfigListener) {
    for (let i = 0, len = configListenerMetadatas.length; i < len; i++) {
        if (configListenerMetadatas[i].callback === toRemove) {
            configListenerMetadatas.splice(i, 1);
            return;
        }
    }
}

export class WireEventTarget {
    _cmp: Element;
    _def: ElementDef;
    _context: Context;
    _wireDef: WireDef;
    _wireTarget: string;

    constructor(
        cmp: Element,
        def: ElementDef,
        context: Context,
        wireDef: WireDef,
        wireTarget: string) {
        this._cmp = cmp;
        this._def = def;
        this._context = context;
        this._wireDef = wireDef;
        this._wireTarget = wireTarget;
    }

    addEventListener(type: string, callback: WireEventTargetCallback): void {
        switch (type) {
            case CONNECT:
                const connectedCallbacks = this._context[CONTEXT_ID][CONTEXT_CONNECTED];
                assert.isFalse(connectedCallbacks.includes(callback as NoArgumentListener), 'must not call addEventListener("connect") with the same callback');
                connectedCallbacks.push(callback as NoArgumentListener);
                break;
            case DISCONNECT:
                const disconnectedCallbacks = this._context[CONTEXT_ID][CONTEXT_DISCONNECTED];
                assert.isFalse(disconnectedCallbacks.includes(callback as NoArgumentListener), 'must not call addEventListener("disconnect") with the same callback');
                disconnectedCallbacks.push(callback as NoArgumentListener);
                break;
            case CONFIG:
                const paramToConfigListenerMetadata = this._context[CONTEXT_ID][CONTEXT_UPDATED];
                const { params } = this._wireDef;
                const configListenerMetadata: ConfigListenerMetadata = {
                    callback,
                    statics: this._wireDef.static,
                    params
                };

                if (params) {
                    Object.keys(params).forEach(param => {
                        const prop = params[param];
                        let configListenerMetadatas = paramToConfigListenerMetadata[prop];
                        if (!configListenerMetadatas) {
                            configListenerMetadatas = [configListenerMetadata];
                            paramToConfigListenerMetadata[prop] = configListenerMetadatas;
                            installSetterOverrides(this._cmp, prop, updated.bind(undefined, this._cmp, prop, this._def, this._context));
                        } else {
                            configListenerMetadatas.push(configListenerMetadata);
                        }
                    });
                }
                break;
            case 'default':
                throw new Error(`unsupported event type ${type}`);
        }
    }

    removeEventListener(type: string, callback: WireEventTargetCallback): void {
        switch (type) {
            case CONNECT:
                const connectedCallbacks = this._context[CONTEXT_ID][CONTEXT_CONNECTED];
                removeCallback(connectedCallbacks, callback);
                break;
            case DISCONNECT:
                const disconnectedCallbacks = this._context[CONTEXT_ID][CONTEXT_DISCONNECTED];
                removeCallback(disconnectedCallbacks, callback);
                break;
            case CONFIG:
                const paramToConfigListenerMetadata = this._context[CONTEXT_ID][CONTEXT_UPDATED];
                const { params } = this._wireDef;
                if (params) {
                    Object.keys(params).forEach(param => {
                        const prop = params[param];
                        const configListenerMetadatas = paramToConfigListenerMetadata[prop];
                        if (configListenerMetadatas) {
                            removeConfigListener(configListenerMetadatas, callback);
                        }
                    });
                }
                break;
            case 'default':
                throw new Error(`unsupported event type ${type}`);
        }
    }

    dispatchEvent(evt: ValueChangedEvent): boolean {
        if (evt instanceof ValueChangedEvent) {
            const value = evt.value;
            if (this._wireDef.method) {
                this._cmp[this._wireTarget](value);
            } else {
                this._cmp[this._wireTarget] = value;
            }
            return false; // canceling signal since we don't want this to propagate
        } else {
            throw new Error(`Invalid event ${evt}.`);
        }
    }
}

/**
 * Event fired by wire adapters to emit a new value.
 */
export class ValueChangedEvent {
    value: any;
    type: string;
    constructor(value) {
        this.type = 'ValueChangedEvent';
        this.value = value;
    }
}
