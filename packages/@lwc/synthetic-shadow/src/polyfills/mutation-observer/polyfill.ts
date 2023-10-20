/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    ArrayIndexOf,
    ArrayPush,
    ArraySplice,
    create,
    defineProperties,
    defineProperty,
    forEach,
    isNull,
    isUndefined,
} from '@lwc/shared';
import { isSyntheticShadowRoot } from '../../faux-shadow/shadow-root';
import { getNodeKey, getNodeNearestOwnerKey } from '../../shared/node-ownership';

const OriginalMutationObserver = MutationObserver;
const {
    disconnect: originalDisconnect,
    observe: originalObserve,
    takeRecords: originalTakeRecords,
} = OriginalMutationObserver.prototype;

// Internal fields to maintain relationships
const wrapperLookupField = '$$lwcObserverCallbackWrapper$$';
const observerLookupField = '$$lwcNodeObservers$$';

const observerToNodesMap: WeakMap<MutationObserver, Array<Node>> = new WeakMap();

function getNodeObservers(node: Node): MutationObserver[] {
    return (node as any)[observerLookupField];
}

function setNodeObservers(node: Node, observers: MutationObserver[]) {
    (node as any)[observerLookupField] = observers;
}

/**
 * Retarget the mutation record's target value to its shadowRoot
 * @param {MutationRecord} originalRecord
 */
function retargetMutationRecord(originalRecord: MutationRecord): MutationRecord {
    const { addedNodes, removedNodes, target, type } = originalRecord;
    const retargetedRecord = create(MutationRecord.prototype);
    defineProperties(retargetedRecord, {
        addedNodes: {
            get() {
                return addedNodes;
            },
            enumerable: true,
            configurable: true,
        },
        removedNodes: {
            get() {
                return removedNodes;
            },
            enumerable: true,
            configurable: true,
        },
        type: {
            get() {
                return type;
            },
            enumerable: true,
            configurable: true,
        },
        target: {
            get() {
                return (target as Element).shadowRoot;
            },
            enumerable: true,
            configurable: true,
        },
    });
    return retargetedRecord;
}

/**
 * Utility to identify if a target node is being observed by the given observer
 * Start at the current node, if the observer is registered to observe the current node, the mutation qualifies
 * @param {MutationObserver} observer
 * @param {Node} target
 */
function isQualifiedObserver(observer: MutationObserver, target: Node): boolean {
    let parentNode: Node | null = target;
    while (!isNull(parentNode)) {
        const parentNodeObservers = getNodeObservers(parentNode);
        if (
            !isUndefined(parentNodeObservers) &&
            (parentNodeObservers[0] === observer || // perf optimization to check for the first item is a match
                ArrayIndexOf.call(parentNodeObservers, observer) !== -1)
        ) {
            return true;
        }
        parentNode = parentNode.parentNode;
    }
    return false;
}

/**
 * This function provides a shadow dom compliant filtered view of mutation records for a given observer.
 *
 * The key logic here is to determine if a given observer has been registered to observe any nodes
 * between the target node of a mutation record to the target's root node.
 * This function also retargets records when mutations occur directly under the shadow root
 * @param {MutationRecords[]} mutations
 * @param {MutationObserver} observer
 */
function filterMutationRecords(
    mutations: MutationRecord[],
    observer: MutationObserver
): MutationRecord[] {
    const result: MutationRecord[] = [];

    for (const record of mutations) {
        const { target, type } = record;
        // If target is an lwc host,
        // Determine if the mutations affected the host or the shadowRoot
        // Mutations affecting host: changes to slot content
        // Mutations affecting shadowRoot: changes to template content
        if (type === 'childList' && !isUndefined(getNodeKey(target))) {
            const { addedNodes } = record;
            // In case of added nodes, we can climb up the tree and determine eligibility
            if (addedNodes.length > 0) {
                // Optimization: Peek in and test one node to decide if the MutationRecord qualifies
                // The remaining nodes in this MutationRecord will have the same ownerKey
                const sampleNode: Node = addedNodes[0];
                if (isQualifiedObserver(observer, sampleNode)) {
                    // If the target was being observed, then return record as-is
                    // this will be the case for slot content
                    const nodeObservers = getNodeObservers(target);
                    if (
                        nodeObservers &&
                        (nodeObservers[0] === observer ||
                            ArrayIndexOf.call(nodeObservers, observer) !== -1)
                    ) {
                        ArrayPush.call(result, record);
                    } else {
                        // else, must be observing the shadowRoot

                        ArrayPush.call(result, retargetMutationRecord(record));
                    }
                }
            } else {
                const { removedNodes } = record;
                // In the case of removed nodes, climbing the tree is not an option as the nodes are disconnected
                // We can only check if either the host or shadow root was observed and qualify the record
                const shadowRoot = (target as Element).shadowRoot;
                const sampleNode = removedNodes[0];
                if (
                    getNodeNearestOwnerKey(target) === getNodeNearestOwnerKey(sampleNode) && // trickery: sampleNode is slot content
                    isQualifiedObserver(observer, target) // use target as a close enough reference to climb up
                ) {
                    ArrayPush.call(result, record);
                } else if (shadowRoot) {
                    const shadowRootObservers = getNodeObservers(shadowRoot);

                    if (
                        shadowRootObservers &&
                        (shadowRootObservers[0] === observer ||
                            ArrayIndexOf.call(shadowRootObservers, observer) !== -1)
                    ) {
                        ArrayPush.call(result, retargetMutationRecord(record));
                    }
                }
            }
        } else {
            // Mutation happened under a root node(shadow root or document) and the decision is straighforward
            // Ascend the tree starting from target and check if observer is qualified
            if (isQualifiedObserver(observer, target)) {
                ArrayPush.call(result, record);
            }
        }
    }
    return result;
}

function getWrappedCallback(callback: MutationCallback): MutationCallback {
    let wrappedCallback: MutationCallback | undefined = (callback as any)[wrapperLookupField];
    if (isUndefined(wrappedCallback)) {
        wrappedCallback = (callback as any)[wrapperLookupField] = (
            mutations: MutationRecord[],
            observer: MutationObserver
        ): void => {
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
function PatchedMutationObserver(
    this: MutationObserver,
    callback: MutationCallback
): MutationObserver {
    const wrappedCallback: any = getWrappedCallback(callback);
    const observer = new OriginalMutationObserver(wrappedCallback);
    return observer;
}

function patchedDisconnect(this: MutationObserver): void {
    originalDisconnect.call(this);

    // Clear the node to observer reference which is a strong references
    const observedNodes = observerToNodesMap.get(this);
    if (!isUndefined(observedNodes)) {
        forEach.call(observedNodes, (observedNode) => {
            const observers = observedNode[observerLookupField];
            if (!isUndefined(observers)) {
                const index = ArrayIndexOf.call(observers, this);
                if (index !== -1) {
                    ArraySplice.call(observers, index, 1);
                }
            }
        });
        observedNodes.length = 0;
    }
}

/**
 * A single mutation observer can observe multiple nodes(target).
 * Maintain a list of all targets that the observer chooses to observe
 * @param {Node} target
 * @param {Object} options
 */
function patchedObserve(
    this: MutationObserver,
    target: Node,
    options?: MutationObserverInit
): void {
    let targetObservers = getNodeObservers(target);

    // Maintain a list of all observers that want to observe a node
    if (isUndefined(targetObservers)) {
        targetObservers = [];
        setNodeObservers(target, targetObservers);
    }
    // Same observer trying to observe the same node
    if (ArrayIndexOf.call(targetObservers, this) === -1) {
        ArrayPush.call(targetObservers, this);
    } // else There is more bookkeeping to do here https://dom.spec.whatwg.org/#dom-mutationobserver-observe Step #7

    // SyntheticShadowRoot instances are not actually a part of the DOM so observe the host instead.
    if (isSyntheticShadowRoot(target)) {
        target = (target as ShadowRoot).host;
    }

    // maintain a list of all nodes observed by this observer
    if (observerToNodesMap.has(this)) {
        const observedNodes = observerToNodesMap.get(this)!;
        if (ArrayIndexOf.call(observedNodes, target) === -1) {
            ArrayPush.call(observedNodes, target);
        }
    } else {
        observerToNodesMap.set(this, [target]);
    }

    return originalObserve.call(this, target, options);
}

/**
 * Patch the takeRecords() api to filter MutationRecords based on the observed targets
 */
function patchedTakeRecords(this: MutationObserver): MutationRecord[] {
    return filterMutationRecords(originalTakeRecords.call(this), this);
}

PatchedMutationObserver.prototype = OriginalMutationObserver.prototype;
PatchedMutationObserver.prototype.disconnect = patchedDisconnect;
PatchedMutationObserver.prototype.observe = patchedObserve;
PatchedMutationObserver.prototype.takeRecords = patchedTakeRecords;

defineProperty(window, 'MutationObserver', {
    value: PatchedMutationObserver,
    configurable: true,
    writable: true,
});
