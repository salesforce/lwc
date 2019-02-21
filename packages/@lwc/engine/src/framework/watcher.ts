/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from '../shared/assert';
import { isUndefined, create, ArrayIndexOf, ArrayPush, isNull, toString } from '../shared/language';

// Typescript doesn't allow indexing using symbol. The ReactiveSymbol actual type is { [key: PropertyKey]: VM[] }.
// Since a PropertyKey can be a Symbol, we need to make the ReactiveRecord type as any for now.
// More details here: https://github.com/Microsoft/TypeScript/issues/1863
type ReactiveRecord = any;

const TargetToReactiveRecordMap: WeakMap<object, ReactiveRecord> = new WeakMap();

export function notifyMutation(target: object, key: PropertyKey) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            !isRendering,
            `Mutating property ${toString(key)} of ${toString(
                target
            )} is not allowed during the rendering life-cycle of ${vmBeingRendered}.`
        );
    }
    const reactiveRecord = TargetToReactiveRecordMap.get(target);
    if (!isUndefined(reactiveRecord)) {
        const value = reactiveRecord[key];
        if (value) {
            const len = value.length;
            for (let i = 0; i < len; i += 1) {
                const vm = value[i];
                if (process.env.NODE_ENV !== 'production') {
                    assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
                }
                if (!vm.isDirty) {
                    markComponentAsDirty(vm);
                    scheduleRehydration(vm);
                }
            }
        }
    }
}

export function observeMutation(target: object, key: PropertyKey) {
    if (isNull(vmBeingRendered)) {
        return; // nothing to subscribe to
    }
    const vm = vmBeingRendered;
    let reactiveRecord = TargetToReactiveRecordMap.get(target);
    if (isUndefined(reactiveRecord)) {
        const newRecord = create(null);
        reactiveRecord = newRecord;
        TargetToReactiveRecordMap.set(target, newRecord);
    }
    let value = reactiveRecord[key];
    if (isUndefined(value)) {
        value = [];
        reactiveRecord[key] = value;
    } else if (value[0] === vm) {
        return; // perf optimization considering that most subscriptions will come from the same vm
    }
    if (ArrayIndexOf.call(value, vm) === -1) {
        ArrayPush.call(value, vm);
        // we keep track of the sets that vm is listening from to be able to do some clean up later on
        ArrayPush.call(vm.deps, value);
    }
}

import { scheduleRehydration } from './vm';
import { markComponentAsDirty } from './component';
import { vmBeingRendered, isRendering } from './invoker';
