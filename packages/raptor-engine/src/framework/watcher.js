import assert from "./assert.js";
import { scheduleRehydration } from "./vm.js";
import { markComponentAsDirty } from "./component.js";
import { isUndefined, toString, create, ArrayIndexOf, ArrayPush } from "./language.js";

const TargetToReactiveRecordMap: Map<Object, ReactiveRecord> = new WeakMap();

export function notifyListeners(target: Object, key: string | Symbol) {
    const reactiveRecord = TargetToReactiveRecordMap.get(target);
    if (reactiveRecord) {
        const value = reactiveRecord[key];
        if (value) {
            const len = value.length;
            for (let i = 0; i < len; i += 1) {
                const vm = value[i];
                assert.vm(vm);
                console.log(`Marking ${vm} as dirty: property "${toString(key)}" of ${toString(target)} was set to a new value.`);
                if (!vm.isDirty) {
                    markComponentAsDirty(vm);
                    console.log(`Scheduling ${vm} for rehydration due to mutation.`);
                    scheduleRehydration(vm);
                }
            }
        }
    }
}

export function subscribeToSetHook(vm: VM, target: Object, key: string | Symbol) {
    assert.vm(vm);
    let reactiveRecord: ReactiveRecord = TargetToReactiveRecordMap.get(target);
    if (isUndefined(reactiveRecord)) {
        const newRecord: ReactiveRecord = create(null);
        reactiveRecord = newRecord;
        TargetToReactiveRecordMap.set(target, newRecord);
    }
    let value = reactiveRecord[key];
    if (isUndefined(value)) {
        value = [];
        reactiveRecord[key] = value;
    }
    if (ArrayIndexOf.call(value, vm) === -1) {
        ArrayPush.call(value, vm);
        // we keep track of the sets that vm is listening from to be able to do some clean up later on
        ArrayPush.call(vm.deps, value);
    }
}
