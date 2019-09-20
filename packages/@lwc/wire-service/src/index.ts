/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const { freeze, defineProperty } = Object;

/**
 * Registers a wire adapter factory for Lightning Platform.
 * @deprecated
 */
export function register(
    adapterId: any,
    adapterEventTargetCallback: (eventTarget: WireEventTarget) => void
) {
    if (adapterId == null || !(adapterId instanceof Object)) {
        throw new TypeError('adapter id must be an object or a function');
    }
    if (typeof adapterEventTargetCallback !== 'function') {
        throw new TypeError('adapter factory must be a callable');
    }
    if ('adapter' in adapterId) {
        throw new TypeError('adapter id is already associated to an adapter factory');
    }

    const AdapterClass = class extends WireAdapter {
        constructor(dataCallback: dataCallback) {
            super(dataCallback);
            adapterEventTargetCallback(this.eventTarget);
        }
    };

    freeze(AdapterClass);
    freeze(AdapterClass.prototype);

    defineProperty(adapterId, 'adapter', {
        writable: false,
        configurable: false,
        value: AdapterClass,
    });
}

import { ValueChangedEvent } from './value-changed-event';

const { forEach, splice: ArraySplice, indexOf: ArrayIndexOf } = Array.prototype;

// wire event target life cycle connectedCallback hook event type
const CONNECT = 'connect';
// wire event target life cycle disconnectedCallback hook event type
const DISCONNECT = 'disconnect';
// wire event target life cycle config changed hook event type
const CONFIG = 'config';

type NoArgumentListener = () => void;
interface ConfigListenerArgument {
    [key: string]: any;
}
type ConfigListener = (config: ConfigListenerArgument) => void;

type WireEventTargetListener = NoArgumentListener | ConfigListener;

export interface WireEventTarget {
    addEventListener: (type: string, listener: WireEventTargetListener) => void;
    removeEventListener: (type: string, listener: WireEventTargetListener) => void;
    dispatchEvent: (evt: ValueChangedEvent) => boolean;
}

function removeListener(listeners: WireEventTargetListener[], toRemove: WireEventTargetListener) {
    const idx = ArrayIndexOf.call(listeners, toRemove);
    if (idx > -1) {
        ArraySplice.call(listeners, idx, 1);
    }
}

type dataCallback = (value: any) => void;
export interface WireAdapterConstructor {
    new (callback: dataCallback): WireAdapter;
}

export class WireAdapter {
    private callback: dataCallback;

    private connecting: NoArgumentListener[] = [];
    private disconnecting: NoArgumentListener[] = [];
    private configuring: ConfigListener[] = [];

    /**
     * Attaching a config listener.
     *
     * The old behavior for attaching a config listener depended on these 3 cases:
     * 1- The wire instance does have any arguments.
     * 2- The wire instance have only static arguments.
     * 3- The wire instance have at least one dynamic argument.
     *
     * In case 1 and 2, the listener should be called immediately.
     * In case 3, the listener needs to wait for the value of the dynamic argument to be updated by the engine.
     *
     * In order to match the above logic, we need to save the last config available:
     * if is undefined, the engine hasn't set it yet, we treat it as case 3. Note: the current logic does not make a distinction between dynamic and static config.
     * if is defined, it means that for the component instance, and this adapter instance, the currentConfig is the proper one
     * and the listener will be called immediately.
     *
     */
    private currentConfig?: ConfigListenerArgument;

    constructor(callback: dataCallback) {
        this.callback = callback;
        this.eventTarget = {
            addEventListener: (type: string, listener: WireEventTargetListener): void => {
                switch (type) {
                    case CONNECT: {
                        this.connecting.push(listener as NoArgumentListener);
                        break;
                    }
                    case DISCONNECT: {
                        this.disconnecting.push(listener as NoArgumentListener);
                        break;
                    }
                    case CONFIG: {
                        this.configuring.push(listener as ConfigListener);

                        if (this.currentConfig !== undefined) {
                            (listener as ConfigListener).call(undefined, this.currentConfig);
                        }
                        break;
                    }
                    default:
                        throw new Error(`Invalid event type ${type}.`);
                }
            },
            removeEventListener: (type: string, listener: WireEventTargetListener): void => {
                switch (type) {
                    case CONNECT: {
                        removeListener(this.connecting, listener);
                        break;
                    }
                    case DISCONNECT: {
                        removeListener(this.disconnecting, listener);
                        break;
                    }
                    case CONFIG: {
                        removeListener(this.configuring, listener);
                        break;
                    }
                    default:
                        throw new Error(`Invalid event type ${type}.`);
                }
            },
            dispatchEvent: (evt: ValueChangedEvent): boolean => {
                if (evt instanceof ValueChangedEvent) {
                    const value = evt.value;
                    this.callback(value);
                } else {
                    throw new Error(`Invalid event type ${(evt as any).type}.`);
                }
                return false; // canceling signal since we don't want this to propagate
            },
        };
    }

    protected eventTarget: WireEventTarget;

    update(config: Record<string, any>) {
        this.currentConfig = config;
        forEach.call(this.configuring, listener => {
            listener.call(undefined, config);
        });
    }

    connect() {
        forEach.call(this.connecting, listener => listener.call(undefined));
    }

    disconnect() {
        forEach.call(this.disconnecting, listener => listener.call(undefined));
    }
}

// re-exporting event constructors
export { ValueChangedEvent };
