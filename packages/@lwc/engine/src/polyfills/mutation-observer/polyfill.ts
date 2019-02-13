/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperty, isUndefined } from '../../shared/language';
import { getNodeNearestOwnerKey, getNodeKey } from '../../faux-shadow/node';
import { SyntheticShadowRoot } from '../../faux-shadow/shadow-root';

const { MutationObserver: OriginalMutationObserver } = (window as any);
const { Observe: OriginalObserve, takeRecords: OriginalTakeRecords } = OriginalMutationObserver.prototype;

// Internal fields to maintain relationships
const observedTargetsField = '$$lwcObservedTargets$$';
const wrapperLookupField = '$$lwcObserverCallbackWrapper$$';

/**
 * Some basic expectations to understand the filtering logic.
 * 1. A single MutationObserver can observe multiple targets
 * 2. A single callback can be user by multiple MutationObservers to handle mutations occuring in different parts of the document
 *
 * This function first gathers the OwnerKey of all the targets observed by the MutationObserver instance.
 * Next, process each MutationRecord to determine if the mutation occured in the same shadow tree as
 * one of the targets being observed.
 * @param {MutationObserver} observer
 * @param {MutationRecords[]} records
 */
function filterMutationRecords(observer: any, records: MutationRecord[]): MutationRecord[] {
    const observedTargets = observer[observedTargetsField];
    const observedTargetOwnerKeys = new Set();
    observedTargets.forEach((node: Node) => {
        // If the observed target is a shadowRoot, the ownerkey of the shadow tree will be fetched using the host
        const observedTargetOwnerKey = node instanceof SyntheticShadowRoot
            ? getNodeKey((node as ShadowRoot).host)
            : getNodeNearestOwnerKey(node);
        observedTargetOwnerKeys.add(observedTargetOwnerKey);
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

/**
 * Patched MutationObserver constructor.
 * 1. Wrap the callback to filter out MutationRecords based on dom ownership
 * 2. Add a property field to track all observed targets of the observer instance
 * @param {MutationCallback} callback
 */
function PatchedMutationObserver(this: MutationObserver, callback: MutationCallback) {
    const wrappedCallback: any = getWrappedCallback(callback);
    const observer = new OriginalMutationObserver(wrappedCallback);
    defineProperty(observer, observedTargetsField, {value : []});
    return observer;
}

/**
 * A single mutation observer can observe multiple nodes(target).
 * Maintain a list of all targets that the observer chooses to observe
 * @param {Node} target
 * @param {Object} options
 */
function PatchedObserve(this: any, target: Node, options?: MutationObserverInit) {
    // If the observer was created by the patched constructor, this field should be defined. Adding a guard for extra safety
    if (!isUndefined(this[observedTargetsField])) {
        this[observedTargetsField].push(target);
    }
    // If the target is a SyntheticShadowRoot, observer the host since the shadowRoot is an empty documentFragment
    if (target instanceof SyntheticShadowRoot) {
        target = (target as ShadowRoot).host;
    }
    return OriginalObserve.call(this, target, options);
}

/**
 * Patch the takeRecords() api to filter MutationRecords based on the observed targets
 */
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
