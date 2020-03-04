/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isUndefined } from '@lwc/shared';
import {
    CONTEXT_ID,
    CONTEXT_CONNECTED,
    CONTEXT_DISCONNECTED,
    CONTEXT_UPDATED,
    CONNECT,
    DISCONNECT,
    CONFIG,
} from './constants';
import { ElementDef, WireDef } from './engine';
import { installTrap, updated } from './property-trap';
import { ValueChangedEvent } from './value-changed-event';
import { LinkContextEvent } from './link-context-event';

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
        [key: string]: any;
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

function removeConfigListener(
    configListenerMetadatas: ConfigListenerMetadata[],
    toRemove: ConfigListener
) {
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
            head: reference,
        };
    }
    const segments = reference.split('.');
    return {
        reference,
        head: segments.shift() as string,
        tail: segments,
    };
}

export class WireEventTarget {
    _cmp: EventTarget;
    _def: ElementDef;
    _context: Context;
    _wireDef: WireDef;
    _wireTarget: string;

    constructor(
        cmp: EventTarget,
        def: ElementDef,
        context: Context,
        wireDef: WireDef,
        wireTarget: string
    ) {
        this._cmp = cmp;
        this._def = def;
        this._context = context;
        this._wireDef = wireDef;
        this._wireTarget = wireTarget;
    }

    addEventListener(type: string, listener: WireEventTargetListener): void {
        switch (type) {
            case CONNECT: {
                const connectedListeners = this._context[CONTEXT_ID][CONTEXT_CONNECTED];
                if (process.env.NODE_ENV !== 'production') {
                    assert.isFalse(
                        connectedListeners.includes(listener as NoArgumentListener),
                        'must not call addEventListener("connect") with the same listener'
                    );
                }
                connectedListeners.push(listener as NoArgumentListener);
                break;
            }

            case DISCONNECT: {
                const disconnectedListeners = this._context[CONTEXT_ID][CONTEXT_DISCONNECTED];
                if (process.env.NODE_ENV !== 'production') {
                    assert.isFalse(
                        disconnectedListeners.includes(listener as NoArgumentListener),
                        'must not call addEventListener("disconnect") with the same listener'
                    );
                }
                disconnectedListeners.push(listener as NoArgumentListener);
                break;
            }

            case CONFIG: {
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
                    reactives,
                };

                // setup listeners for all reactive parameters
                const configContext = this._context[CONTEXT_ID][CONTEXT_UPDATED];
                const reactiveParametersGroupByHead: Record<string, Array<ReactiveParameter>> = {};

                reactiveKeys.forEach(key => {
                    const reactiveParameter = buildReactiveParameter(reactives[key]);
                    const reactiveParameterHead = reactiveParameter.head;
                    let configListenerMetadatas = configContext.listeners[reactiveParameterHead];

                    let reactiveParametersWithSameHead =
                        reactiveParametersGroupByHead[reactiveParameterHead];

                    if (isUndefined(reactiveParametersWithSameHead)) {
                        reactiveParametersWithSameHead = [];
                        reactiveParametersGroupByHead[
                            reactiveParameterHead
                        ] = reactiveParametersWithSameHead;
                    }

                    reactiveParametersWithSameHead.push(reactiveParameter);

                    if (!configListenerMetadatas) {
                        configListenerMetadatas = [configListenerMetadata];
                        configContext.listeners[reactiveParameterHead] = configListenerMetadatas;
                        installTrap(
                            this._cmp,
                            reactiveParameterHead,
                            reactiveParametersWithSameHead,
                            configContext
                        );
                    } else {
                        configListenerMetadatas.push(configListenerMetadata);
                    }
                });

                // enqueue to pickup default values
                Object.keys(reactiveParametersGroupByHead).forEach(head => {
                    updated(this._cmp, reactiveParametersGroupByHead[head], configContext);
                });

                break;
            }

            default:
                throw new Error(`unsupported event type ${type}`);
        }
    }

    removeEventListener(type: string, listener: WireEventTargetListener): void {
        switch (type) {
            case CONNECT: {
                const connectedListeners = this._context[CONTEXT_ID][CONTEXT_CONNECTED];
                removeListener(connectedListeners, listener);
                break;
            }

            case DISCONNECT: {
                const disconnectedListeners = this._context[CONTEXT_ID][CONTEXT_DISCONNECTED];
                removeListener(disconnectedListeners, listener);
                break;
            }

            case CONFIG: {
                const paramToConfigListenerMetadata = this._context[CONTEXT_ID][CONTEXT_UPDATED]
                    .listeners;
                const reactives = this._wireDef.params;
                if (reactives) {
                    Object.keys(reactives).forEach(key => {
                        const reactiveParameter = buildReactiveParameter(reactives[key]);
                        const configListenerMetadatas =
                            paramToConfigListenerMetadata[reactiveParameter.head];
                        if (configListenerMetadatas) {
                            removeConfigListener(configListenerMetadatas, listener);
                        }
                    });
                }
                break;
            }

            default:
                throw new Error(`unsupported event type ${type}`);
        }
    }

    dispatchEvent(evt: ValueChangedEvent | LinkContextEvent | Event): boolean {
        if (evt instanceof ValueChangedEvent) {
            const value = evt.value;
            if (this._wireDef.method) {
                this._cmp[this._wireTarget](value);
            } else {
                this._cmp[this._wireTarget] = value;
            }
            return false; // canceling signal since we don't want this to propagate
        } else if (evt instanceof LinkContextEvent) {
            const { uid, callback } = evt;
            // This event is responsible for connecting the host element with another
            // element in the composed path that is providing contextual data. The provider
            // must be listening for a special dom event with the name corresponding to `uid`,
            // which must remain secret, to guarantee that the linkage is only possible via
            // the corresponding wire adapter.
            const internalDomEvent = new CustomEvent(uid, {
                bubbles: true,
                composed: true,
                // avoid leaking the callback function directly to prevent a side channel
                // during the linking phase to the context provider.
                detail(...args: any[]) {
                    callback(...args);
                },
            });
            this._cmp.dispatchEvent(internalDomEvent);
            return false; // canceling signal since we don't want this to propagate
        } else if (evt.type === 'wirecontextevent') {
            // TODO [#1357]: remove this branch
            return this._cmp.dispatchEvent(evt);
        } else {
            throw new Error(`Invalid event ${evt}.`);
        }
    }
}
