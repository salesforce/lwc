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
    WireDef,
    ComposableEvent
} from './engine';
import {
    installTrap
} from './property-trap';

export type NoArgumentListener = () => void;
export interface ConfigListenerArgument {
    [key: string]: any;
}
export type ConfigListener = (ConfigListenerArgument) => void;

// config params (WireDef.params.key) may be dot-separated strings to traverse into @api and @wire properties
export interface ParamDefinition {
    full: string; // the original WireDef.params.key
    root: string; // first segment of the key
    remainder?: string[]; // remaining segments of the key, if it's dot-separated
}

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
    mutated?: Set<ParamDefinition>;
}

export interface WireContext {
    [CONTEXT_CONNECTED]: NoArgumentListener[];
    [CONTEXT_DISCONNECTED]: NoArgumentListener[];
    [CONTEXT_UPDATED]: ConfigContext;
}

export interface Context {
    [CONTEXT_ID]: WireContext;
}

export type WireEventTargetListener = NoArgumentListener | ConfigListener;

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

function buildParamDefinition(prop: string): ParamDefinition {
    if (!prop.includes('.')) {
        return {
            full: prop,
            root: prop
        };
    }
    const segments = prop.split('.');
    return {
        full: prop,
        root: segments.shift() as string,
        remainder: segments
    };
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

    addEventListener(type: string, listener: WireEventTargetListener): void {
        switch (type) {
            case CONNECT:
                const connectedListeners = this._context[CONTEXT_ID][CONTEXT_CONNECTED];
                if (process.env.NODE_ENV !== 'production') {
                    assert.isFalse(connectedListeners.includes(listener as NoArgumentListener), 'must not call addEventListener("connect") with the same listener');
                }
                connectedListeners.push(listener as NoArgumentListener);
                break;

            case DISCONNECT:
                const disconnectedListeners = this._context[CONTEXT_ID][CONTEXT_DISCONNECTED];
                if (process.env.NODE_ENV !== 'production') {
                    assert.isFalse(disconnectedListeners.includes(listener as NoArgumentListener), 'must not call addEventListener("disconnect") with the same listener');
                }
                disconnectedListeners.push(listener as NoArgumentListener);
                break;

            case CONFIG:
                const params = this._wireDef.params;
                const statics = this._wireDef.static;
                let paramsKeys: string[];

                // no dynamic params. fire config once with static params (if present).
                if (!params || (paramsKeys = Object.keys(params)).length === 0) {
                    const config = statics || {};
                    listener.call(undefined, config);
                    return;
                }

                const configListenerMetadata: ConfigListenerMetadata = {
                    listener,
                    statics,
                    params
                };

                const configContext = this._context[CONTEXT_ID][CONTEXT_UPDATED];
                paramsKeys.forEach(param => {
                    const paramDefn = buildParamDefinition(params[param]);
                    let configListenerMetadatas = configContext.listeners[paramDefn.root];
                    if (!configListenerMetadatas) {
                        configListenerMetadatas = [configListenerMetadata];
                        configContext.listeners[paramDefn.root] = configListenerMetadatas;
                        installTrap(this._cmp, paramDefn, configContext);
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
                const connectedListeners = this._context[CONTEXT_ID][CONTEXT_CONNECTED];
                removeListener(connectedListeners, listener);
                break;

            case DISCONNECT:
                const disconnectedListeners = this._context[CONTEXT_ID][CONTEXT_DISCONNECTED];
                removeListener(disconnectedListeners, listener);
                break;

            case CONFIG:
                const paramToConfigListenerMetadata = this._context[CONTEXT_ID][CONTEXT_UPDATED].listeners;
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
                this._cmp[this._wireTarget](value);
            } else {
                this._cmp[this._wireTarget] = value;
            }
            return false; // canceling signal since we don't want this to propagate
        } else if ((evt as ComposableEvent).type === 'WireContextEvent') {
            // NOTE: kill this hack
            // we should only allow ValueChangedEvent
            // however, doing so would require adapter to implement machinery
            // that fire the intended event as DOM event and wrap inside ValueChagnedEvent
            return this._cmp.dispatchEvent(evt);
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
