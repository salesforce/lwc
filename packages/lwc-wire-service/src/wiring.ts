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
import {
    installTrap
} from './property-trap';

export type NoArgumentListener = () => void;
export interface ConfigListenerArgument {
    [key: string]: any;
}
export type ConfigListener = (ConfigListenerArgument) => void;
export interface ConfigListenerMetadata {
    callback: ConfigListener;
    statics?: {
        [key: string]: any;
    };
    params?: {
        [key: string]: string;
    };
}
export interface ConfigContext {
    // map of param to list of config listeners
    // when a param changes O(1) lookup to list of config listeners to notify
    listeners: {
        [prop: string]: ConfigListenerMetadata[];
    };
    // map of param values
    values: {
        [prop: string]: any
    };
    // mutated props (debounced then cleared)
    mutated?: Set<string>;
}

export interface WireContext {
    [CONTEXT_CONNECTED]: NoArgumentListener[];
    [CONTEXT_DISCONNECTED]: NoArgumentListener[];
    [CONTEXT_UPDATED]: ConfigContext;
}

export interface Context {
    [CONTEXT_ID]: WireContext;
}

export type WireEventTargetCallback = NoArgumentListener | ConfigListener;

function removeCallback(callbacks: WireEventTargetCallback[], toRemove: WireEventTargetCallback) {
    const idx = callbacks.indexOf(toRemove);
    if (idx > -1) {
        callbacks.splice(idx, 1);
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
                const params = this._wireDef.params;
                const statics = this._wireDef.static;

                // no dynamic params, only static, so fire config once
                if (!params) {
                    const config = statics || {};
                    callback.call(undefined, config);
                    return;
                }

                const configListenerMetadata: ConfigListenerMetadata = {
                    callback,
                    statics,
                    params
                };

                const configContext = this._context[CONTEXT_ID][CONTEXT_UPDATED];
                Object.keys(params).forEach(param => {
                    const prop = params[param];
                    let configListenerMetadatas = configContext[prop];
                    if (!configListenerMetadatas) {
                        configListenerMetadatas = [configListenerMetadata];
                        configContext.listeners[prop] = configListenerMetadatas;
                        installTrap(this._cmp, prop, configContext);
                    } else {
                        configListenerMetadatas.push(configListenerMetadata);
                    }
                });
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
