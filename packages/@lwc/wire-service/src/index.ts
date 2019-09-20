/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Registers a wire adapter factory for Lightning Platform.
 * @deprecated
 */
export function register(
    adapterId: any,
    adapterEventTargetCallback: (eventTarget: WireEventTarget) => void
) {
    if (adapterId == null || !(adapterId instanceof Object)) {
        new TypeError('adapter id must be an object or a function');
    }
    if (typeof adapterEventTargetCallback !== 'function') {
        new TypeError('adapter factory must be a callable');
    }
    if ('adapter' in adapterId) {
        new TypeError('adapter id is already associated to an adapter factory');
    }
    adapterId.adapter = class extends WireAdapter {
        constructor(dataCallback: dataCallback) {
            super(dataCallback);
            adapterEventTargetCallback(this.eventTarget);
        }
    };
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
