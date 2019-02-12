/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperty, isUndefined } from '../../shared/language';
import { getNodeNearestOwnerKey } from '../../faux-shadow/node';

const { MutationObserver: OriginalMutationObserver } = (window as any);
const { Observe: OriginalObserve, takeRecords: OriginalTakeRecords } = OriginalMutationObserver.prototype;

// Internal fields to maintain relationships
const observedTargetsField = '$$lwcObservedTargets$$';
const wrapperLookupField = '$$lwcObserverCallbackWrapper$$';

function filterMutationRecords(observer: any, records: MutationRecord[]): MutationRecord[] {
    const observedTargets = observer[observedTargetsField];
    const observedTargetOwnerKeys = new Set();
    observedTargets.forEach((element: Node) => {
        observedTargetOwnerKeys.add(getNodeNearestOwnerKey(element));
    });
    return records.filter((record: MutationRecord) => {  
        const { target } = record;
        if ( target ) {
            return observedTargetOwnerKeys.has(getNodeNearestOwnerKey(target));
        }
        return false;
    });
}

function getWrappedCallback(callback: MutationCallback): MutationCallback {
    let wrappedCallback: MutationCallback | undefined = (callback as any)[wrapperLookupField];
    if (isUndefined(wrappedCallback)) {
        wrappedCallback = (callback as any)[wrapperLookupField] =
            (mutations: MutationRecord[], observer: MutationObserver): void => {
                // Filter mutation records
                const filteredRecords = filterMutationRecords(observer, mutations);
                callback.call(undefined, filteredRecords, observer);
            };
    }
    return wrappedCallback;
}

function PatchedMutationObserver(this: MutationObserver, callback: MutationCallback) {
    const wrappedCallback: any = getWrappedCallback(callback);
    const observer = new MutationObserver(wrappedCallback);
    defineProperty(observer, observedTargetsField, {value : []});
    return observer;
}

/**
 * A single mutation observer can observe multiple nodes(target).
 * Maintain a list of all targets that the observer chooses to observe
 * @param this MutationObserver
 * @param target Node
 * @param options
 */
function PatchedObserve(this: any, target: Node, options?: MutationObserverInit) {
    // If the observer was created by the patched constructor, this field should be defined. Adding a guard for extra safety
    if (!isUndefined(this[observedTargetsField])) {
        this[observedTargetsField].push(target);
    }
    return OriginalObserve.call(this, target, options);
}

function PatchedTakeRecords(this: MutationObserver) {
    const filteredRecords = filterMutationRecords(this, OriginalTakeRecords.call(this));
    return filteredRecords;
}

export default function apply() {
    (window as any).MutationObserver = PatchedMutationObserver;
    (window as any).MutationObserver.prototype = OriginalMutationObserver.prototype;
    (window as any).MutationObserver.prototype.observe = PatchedObserve;
    (window as any).MutationObserver.prototype.takeRecords = PatchedTakeRecords;
}
