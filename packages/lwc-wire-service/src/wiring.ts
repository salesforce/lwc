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
    installTrap,
    updated
} from './property-trap';

export type NoArgumentListener = () => void;
export interface ConfigListenerArgument {
    [key: string]: any;
}
export type ConfigListener = (ConfigListenerArgument) => void;

// a reactive parameter (WireDef.params.key) may be a dot-notation string to traverse into another @wire's target
export interface ReactiveParameter {
    reference: string; // the complete parameter (aka original WireDef.params.key)
    head: string; // head of the parameter
    tail?: string[]; // remaining tail of the parameter, present if it's dot-notation
}

export interface ConfigListenerMetadata {
    listener: ConfigListener;
    statics?: {
        [key: string]: any;
    };
    reactives?: {
        [key: string]: string;
    };
}
export interface ConfigContext {
    // map of reactive parameters to list of config listeners
    // when a reactive parameter changes it's a O(1) lookup to the list of config listeners to notify
    listeners: {
        [key: string]: ConfigListenerMetadata[];
    };
    // map of param values
    values: {
        [key: string]: any
    };
    // mutated reactive parameters (debounced then cleared)
    mutated?: Set<ReactiveParameter>;
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

function buildReactiveParameter(reference: string): ReactiveParameter {
    if (!reference.includes('.')) {
        return {
            reference,
            head: reference
        };
    }
    const segments = reference.split('.');
    return {
        reference,
        head: segments.shift() as string,
        tail: segments
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
                const reactives = this._wireDef.params;
                const statics = this._wireDef.static;
                let reactiveKeys: string[];

                // no reactive parameters. fire config once with static parameters (if present).
                if (!reactives || (reactiveKeys = Object.keys(reactives)).length === 0) {
                    const config = statics || Object.create(null);
                    listener.call(undefined, config);
                    return;
                }

                const configListenerMetadata: ConfigListenerMetadata = {
                    listener,
                    statics,
                    reactives
                };

                // setup listeners for all reactive parameters
                const configContext = this._context[CONTEXT_ID][CONTEXT_UPDATED];
                reactiveKeys.forEach(key => {
                    const reactiveParameter = buildReactiveParameter(reactives[key]);
                    let configListenerMetadatas = configContext.listeners[reactiveParameter.head];
                    if (!configListenerMetadatas) {
                        configListenerMetadatas = [configListenerMetadata];
                        configContext.listeners[reactiveParameter.head] = configListenerMetadatas;
                        installTrap(this._cmp, reactiveParameter, configContext);
                    } else {
                        configListenerMetadatas.push(configListenerMetadata);
                    }
                    // enqueue to pickup default values
                    updated(this._cmp, reactiveParameter, configContext);
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
                const reactives = this._wireDef.params;
                if (reactives) {
                    Object.keys(reactives).forEach(key => {
                        const reactiveParameter = buildReactiveParameter(reactives[key]);
                        const configListenerMetadatas = paramToConfigListenerMetadata[reactiveParameter.head];
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
            // that fire the intended event as DOM event and wrap inside ValueChangedEvent
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
