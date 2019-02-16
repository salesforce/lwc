/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayIndexOf, ArrayReduce, ArrayPush, create, defineProperty, defineProperties, forEach, isUndefined } from '../../shared/language';
import { getNodeNearestOwnerKey, getNodeKey } from '../../faux-shadow/node';
import { SyntheticShadowRoot } from '../../faux-shadow/shadow-root';

const OriginalMutationObserver: typeof MutationObserver = (window as any).MutationObserver;
const { disconnect: originalDisconnect, observe: originalObserve, takeRecords: originalTakeRecords } = OriginalMutationObserver.prototype;

// Internal fields to maintain relationships
const observedTargetsField = '$$lwcObservedTargets$$';
const wrapperLookupField = '$$lwcObserverCallbackWrapper$$';

/**
 * Retarget the mutation record's target value to its shadowRoot
 * @param {MutationRecord} originalRecord
 */
function retargetMutationRecord(originalRecord: MutationRecord): MutationRecord {
    const { addedNodes, removedNodes, target, type} = originalRecord;
    const retargetedRecord = create(MutationRecord.prototype);
    defineProperties(retargetedRecord, {
        addedNodes: {
            get() { return addedNodes; },
            enumerable: true,
            configurable: true
        },
        removedNodes: {
            get() { return removedNodes; },
            enumerable: true,
            configurable: true
        },
        type: {
            get() { return type; },
            enumerable: true,
            configurable: true
        },
        target: {
            get() { return (target as Element).shadowRoot; },
            enumerable: true,
            configurable: true
        }
    });
    return retargetedRecord;
}

/**
 * This function first gathers the OwnerKey of all the targets observed by the MutationObserver instance.
 * Next, process each MutationRecord to determine if the mutation occured in the same shadow tree as
 * one of the targets being observed.
 * 
 * The key filtering logic is to match the observed target node's ownerKey/ownKey with the ownerKey of the nodes in the
 * MutationRecord.
 * The ownerKey of the rootnode will be undefined. Similarly ownerkey of nodes outside the shadow will be undefined.
 * @param {MutationRecords[]} mutations
 * @param {MutationObserver} observer
 */
function filterMutationRecords(mutations: MutationRecord[], observer: MutationObserver): MutationRecord[] {
    const observedTargets = observer[observedTargetsField];
    const observedTargetOwnerKeys: Array<(number|undefined)> = [];
    forEach.call(observedTargets, (node: Node) => {
        // If the observed target is a shadowRoot, the ownerkey of the shadow tree will be fetched using the host
        const observedTargetOwnerKey = node instanceof SyntheticShadowRoot
            ? getNodeKey((node as ShadowRoot).host)
            : getNodeNearestOwnerKey(node);
        ArrayPush.call(observedTargetOwnerKeys, observedTargetOwnerKey);
    });
    return ArrayReduce.call(
        mutations,
        (filteredSet, record: MutationRecord) => {
            const { target , addedNodes, removedNodes, type } = record;
            // If the mutations affected a lwc host element or its shadow,
            // because LWC uses synthetic shadow, target will be the host
            if (type === 'childList' && !isUndefined(getNodeKey(target))) {
                // Optimization: Peek in and test one node to decide if the MutationRecord qualifies
                // The remaining nodes in this MutationRecord will have the same ownerKey
                const sampleNode: Node = addedNodes.length > 0 ? addedNodes[0] : removedNodes[0];
                const sampleNodeOwnerKey = getNodeNearestOwnerKey(sampleNode);
                // Is node being added/removed to a subtree that is being observed
                if (ArrayIndexOf.call(observedTargetOwnerKeys, sampleNodeOwnerKey) !== -1) {
                    // If the target was being observed, the return record as-is
                    if (observedTargets.indexOf(target) !== -1) {
                        ArrayPush.call(filteredSet, record);
                    } else { // else, must be observing the shadowRoot
                        ArrayPush.call(filteredSet, retargetMutationRecord(record));
                    }
                }
            } else {
                const mutationInScope = ArrayIndexOf.call(observedTargetOwnerKeys, getNodeNearestOwnerKey(target)) !== -1;
                if (mutationInScope) {
                    ArrayPush.call(filteredSet, record);
                }
            }
            return filteredSet;
        }, []) as MutationRecord[];
}

function getWrappedCallback(callback: MutationCallback): MutationCallback {
    let wrappedCallback: MutationCallback | undefined = (callback as any)[wrapperLookupField];
    if (isUndefined(wrappedCallback)) {
        wrappedCallback = (callback as any)[wrapperLookupField] =
            (mutations: MutationRecord[], observer: MutationObserver): void => {
                // Filter mutation records
                const filteredRecords = filterMutationRecords(mutations, observer);
                // If not records are eligible for the observer, do not invoke callback
                if (filteredRecords.length === 0) {
                    return;
                }
                callback.call(observer, filteredRecords, observer);
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
function PatchedMutationObserver(this: MutationObserver, callback: MutationCallback): MutationObserver {
    const wrappedCallback: any = getWrappedCallback(callback);
    const observer = new OriginalMutationObserver(wrappedCallback);
    defineProperty(observer, observedTargetsField, {value : []});
    return observer;
}

function patchedDisconnect(this: MutationObserver): void {
    if (!isUndefined(this[observedTargetsField])) {
        this[observedTargetsField].length = 0;
    }
    originalDisconnect.call(this);
}

/**
 * A single mutation observer can observe multiple nodes(target).
 * Maintain a list of all targets that the observer chooses to observe
 * @param {Node} target
 * @param {Object} options
 */
function patchedObserve(this: MutationObserver, target: Node, options?: MutationObserverInit): void {
    // If the observer was created by the patched constructor, this field should be defined. Adding a guard for extra safety
    if (!isUndefined(this[observedTargetsField])) {
        ArrayPush.call(this[observedTargetsField], target);
    }
    // If the target is a SyntheticShadowRoot, observer the host since the shadowRoot is an empty documentFragment
    if (target instanceof SyntheticShadowRoot) {
        target = (target as ShadowRoot).host;
    }
    return originalObserve.call(this, target, options);
}

/**
 * Patch the takeRecords() api to filter MutationRecords based on the observed targets
 */
function patchedTakeRecords(this: MutationObserver): MutationRecord[] {
    return filterMutationRecords(originalTakeRecords.call(this), this);
}

export default function apply() {
    (window as any).MutationObserver = PatchedMutationObserver;
    (window as any).MutationObserver.prototype = OriginalMutationObserver.prototype;
    (window as any).MutationObserver.prototype.disconnect = patchedDisconnect;
    (window as any).MutationObserver.prototype.observe = patchedObserve;
    (window as any).MutationObserver.prototype.takeRecords = patchedTakeRecords;
}
