import assert from "./assert";
import { scheduleRehydration, VM } from "./vm";
import { markComponentAsDirty } from "./component";
import { isUndefined, create, ArrayIndexOf, ArrayPush } from "./language";

interface ReactiveRecord {
    // TODO: this type definition is missing numbers and symbols as keys
    [key: string]: VM[];
}

const TargetToReactiveRecordMap: WeakMap<object, ReactiveRecord> = new WeakMap();

export function notifyListeners(target: object, key: PropertyKey) {
    const reactiveRecord = TargetToReactiveRecordMap.get(target);
    if (!isUndefined(reactiveRecord)) {
        const value = reactiveRecord[key];
        if (value) {
            const len = value.length;
            for (let i = 0; i < len; i += 1) {
                const vm = value[i];
                if (process.env.NODE_ENV !== 'production') {
                    assert.vm(vm);
                }
                if (!vm.isDirty) {
                    markComponentAsDirty(vm);
                    scheduleRehydration(vm);
                }
            }
        }
    }
}

export function subscribeToSetHook(vm: VM, target: object, key: PropertyKey) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
    }
    let reactiveRecord = TargetToReactiveRecordMap.get(target);
    if (isUndefined(reactiveRecord)) {
        const newRecord = create(null) as ReactiveRecord;
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
