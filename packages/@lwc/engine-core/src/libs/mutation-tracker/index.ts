/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { create, isUndefined, ArraySplice, ArrayIndexOf, ArrayPush } from '@lwc/shared';

const TargetToReactiveRecordMap: WeakMap<object, ReactiveRecord> = new WeakMap();

/**
 * An Observed MemberProperty Record represents the list of all Reactive Observers,
 * if any, where the member property was observed.
 */
type ObservedMemberPropertyRecords = ReactiveObserver[];

/**
 * A Reactive Record is a meta representation of an arbitrary object and its member
 * properties that were accessed while a Reactive Observer was observing.
 */
type ReactiveRecord = Record<PropertyKey, ObservedMemberPropertyRecords>;

function getReactiveRecord(target: object): ReactiveRecord {
    let reactiveRecord = TargetToReactiveRecordMap.get(target);
    if (isUndefined(reactiveRecord)) {
        const newRecord: ReactiveRecord = create(null);
        reactiveRecord = newRecord;
        TargetToReactiveRecordMap.set(target, newRecord);
    }
    return reactiveRecord;
}

let currentReactiveObserver: ReactiveObserver | null = null;

export function valueMutated(target: object, key: PropertyKey) {
    const reactiveRecord = TargetToReactiveRecordMap.get(target);
    if (!isUndefined(reactiveRecord)) {
        const reactiveObservers = reactiveRecord[key as any];
        if (!isUndefined(reactiveObservers)) {
            for (let i = 0, len = reactiveObservers.length; i < len; i += 1) {
                const ro = reactiveObservers[i];
                ro.notify();
            }
        }
    }
}

export function valueObserved(target: object, key: PropertyKey) {
    // We should determine if an active Observing Record is present to track mutations.
    if (currentReactiveObserver === null) {
        return;
    }
    const ro = currentReactiveObserver;
    const reactiveRecord = getReactiveRecord(target);
    let reactiveObservers = reactiveRecord[key as any];
    if (isUndefined(reactiveObservers)) {
        reactiveObservers = [];
        reactiveRecord[key as any] = reactiveObservers;
    } else if (reactiveObservers[0] === ro) {
        return; // perf optimization considering that most subscriptions will come from the same record
    }
    if (ArrayIndexOf.call(reactiveObservers, ro) === -1) {
        ro.link(reactiveObservers);
    }
}

export type CallbackFunction = (rp: ReactiveObserver) => void;
export type JobFunction = () => void;

export class ReactiveObserver {
    private listeners: ObservedMemberPropertyRecords[] = [];
    private callback: CallbackFunction;

    constructor(callback: CallbackFunction) {
        this.callback = callback;
    }

    observe(job: JobFunction) {
        const inceptionReactiveRecord = currentReactiveObserver;
        currentReactiveObserver = this;
        let error;
        try {
            job();
        } catch (e) {
            error = Object(e);
        } finally {
            currentReactiveObserver = inceptionReactiveRecord;
            if (error !== undefined) {
                throw error; // eslint-disable-line no-unsafe-finally
            }
        }
    }
    /**
     * This method is responsible for disconnecting the Reactive Observer
     * from any Reactive Record that has a reference to it, to prevent future
     * notifications about previously recorded access.
     */
    reset() {
        const { listeners } = this;
        const len = listeners.length;
        if (len > 0) {
            for (let i = 0; i < len; i++) {
                const set = listeners[i];
                if (set.length === 1) {
                    // Perf optimization for the common case - the length is usually 1, so avoid the indexOf+splice.
                    // If the length is 1, we can also be sure that `this` is the first item in the array.
                    set.length = 0;
                } else {
                    // Slow case
                    const pos = ArrayIndexOf.call(set, this);
                    ArraySplice.call(set, pos, 1);
                }
            }
            listeners.length = 0;
        }
    }

    // friend methods
    notify() {
        this.callback.call(undefined, this);
    }

    link(reactiveObservers: ReactiveObserver[]) {
        ArrayPush.call(reactiveObservers, this);
        // we keep track of observing records where the observing record was added to so we can do some clean up later on
        ArrayPush.call(this.listeners, reactiveObservers);
    }
}
