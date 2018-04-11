import assert from './assert';
import { Component } from "./component";
import { Context } from "./context";
import { VM, HashTable } from "./vm";
import { notifyMutation } from "./watcher";

// key in engine service context for wire service context
export const WIRE_CONTEXT_ID = '@wire';
// key in wire service context for updated listener metadata
export const CONTEXT_UPDATED = 'updated';
// key in wire service context for connected listener metadata
export const CONTEXT_CONNECTED = 'connected';
// key in wire service context for disconnected listener metadata
export const CONTEXT_DISCONNECTED = 'disconnected';

// wire event target life cycle connectedCallback hook event type
export const CONNECT = "connect";
// wire event target life cycle disconnectedCallback hook event type
export const DISCONNECT = "disconnect";
// wire event target life cycle config changed hook event type
export const CONFIG = "config";

export type NoArgumentListener = () => void;
export interface ConfigListenerArgument {
    [key: string]: any;
}
export type ConfigListener = (ConfigListenerArgument) => void;
export interface ConfigListenerMetadata {
    listener: ConfigListener;
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
    mutated: Set<string>;
}

export interface WireContext {
    [CONTEXT_CONNECTED]: NoArgumentListener[];
    [CONTEXT_DISCONNECTED]: NoArgumentListener[];
    [CONTEXT_UPDATED]: ConfigContext;
}

export interface Context {
    [WIRE_CONTEXT_ID]: WireContext;
}

export type WireEventTargetListener = NoArgumentListener | ConfigListener;

export interface WireDef {
    params: {
        [key: string]: string;
    };
    static?: {
        [key: string]: any;
    };
    adapter: any;
    method?: 1;
}

function removeListener(listeners: WireEventTargetListener[], toRemove: WireEventTargetListener) {
    const idx = listeners.indexOf(toRemove);
    if (idx > -1) {
        listeners.splice(idx, 1);
    }
}

function removeConfigListener(configListenerMetadatas: ConfigListenerMetadata[], toRemove: ConfigListener) {
    for (let i = 0, len = configListenerMetadatas.length; i < len; i++) {
        if (configListenerMetadatas[i].listener === toRemove) {
            configListenerMetadatas.splice(i, 1);
            return;
        }
    }
}

export class WireEventTarget {
    _vm: VM;
    _context: Context;
    _wireDef: WireDef;
    _wireTarget: string;

    constructor(
        vm: VM,
        context: Context,
        wireDef: WireDef,
        wireTarget: string) {
        this._vm = vm;
        this._context = context;
        this._wireDef = wireDef;
        this._wireTarget = wireTarget;
    }

    addEventListener(type: string, listener: WireEventTargetListener): void {
        switch (type) {
            case CONNECT:
                const connectedListeners = this._context[WIRE_CONTEXT_ID][CONTEXT_CONNECTED];
                assert.isFalse(connectedListeners.includes(listener as NoArgumentListener), 'must not call addEventListener("connect") with the same listener');
                connectedListeners.push(listener as NoArgumentListener);
                break;

            case DISCONNECT:
                const disconnectedListeners = this._context[WIRE_CONTEXT_ID][CONTEXT_DISCONNECTED];
                assert.isFalse(disconnectedListeners.includes(listener as NoArgumentListener), 'must not call addEventListener("disconnect") with the same listener');
                disconnectedListeners.push(listener as NoArgumentListener);
                break;

            case CONFIG:
                const params = this._wireDef.params;
                const statics = this._wireDef.static;
                const paramsKeys = Object.keys(params);

                // no dynamic params, only static, so fire config once
                if (paramsKeys.length === 0) {
                    const config = statics || {};
                    listener.call(undefined, config);
                    return;
                }

                const configListenerMetadata: ConfigListenerMetadata = {
                    listener,
                    statics,
                    params
                };

                const configContext = this._context[WIRE_CONTEXT_ID][CONTEXT_UPDATED];
                paramsKeys.forEach(param => {
                    const prop = params[param];
                    let configListenerMetadatas = configContext.listeners[prop];
                    if (!configListenerMetadatas) {
                        configListenerMetadatas = [configListenerMetadata];
                        configContext.listeners[prop] = configListenerMetadatas;
                    } else {
                        configListenerMetadatas.push(configListenerMetadata);
                    }
                });
                break;

            default:
                throw new Error(`unsupported event type ${type}`);
        }
    }

    removeEventListener(type: string, listener: WireEventTargetListener): void {
        switch (type) {
            case CONNECT:
                const connectedListeners = this._context[WIRE_CONTEXT_ID][CONTEXT_CONNECTED];
                removeListener(connectedListeners, listener);
                break;

            case DISCONNECT:
                const disconnectedListeners = this._context[WIRE_CONTEXT_ID][CONTEXT_DISCONNECTED];
                removeListener(disconnectedListeners, listener);
                break;

            case CONFIG:
                const paramToConfigListenerMetadata = this._context[WIRE_CONTEXT_ID][CONTEXT_UPDATED].listeners;
                const { params } = this._wireDef;
                if (params) {
                    Object.keys(params).forEach(param => {
                        const prop = params[param];
                        const configListenerMetadatas = paramToConfigListenerMetadata[prop];
                        if (configListenerMetadatas) {
                            removeConfigListener(configListenerMetadatas, listener);
                        }
                    });
                }
                break;

            default:
                throw new Error(`unsupported event type ${type}`);
        }
    }

    dispatchEvent(evt: ValueChangedEvent): boolean {
        if (evt instanceof ValueChangedEvent) {
            const value = evt.value;
            if (this._wireDef.method) {
                (this._vm.component as Component)[this._wireTarget](value);
            } else {
                (this._vm.wireValues as HashTable<any>)[this._wireTarget] = value;
                notifyMutation(this._vm.component as object, this._wireTarget);
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
