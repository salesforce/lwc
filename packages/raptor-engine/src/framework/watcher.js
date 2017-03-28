import assert from "./assert.js";
import { scheduleRehydration } from "./vm.js";
import { markComponentAsDirty } from "./component.js";
import { isUndefined } from "./language.js";

const TargetToPropsMap = new WeakMap();

export function notifyListeners(target: Object, key: string | Symbol) {
    if (TargetToPropsMap.has(target)) {
        const PropNameToListenersMap = TargetToPropsMap.get(target);
        const set = PropNameToListenersMap.get(key);
        if (set) {
            set.forEach((vm: VM) => {
                assert.vm(vm);
                console.log(`Marking ${vm} as dirty: property "${key}" of ${target} was set to a new value.`);
                if (!vm.isDirty) {
                    markComponentAsDirty(vm);
                    console.log(`Scheduling ${vm} for rehydration due to mutation.`);
                    scheduleRehydration(vm);
                }
            });
        }
    }
}

export function subscribeToSetHook(vm: VM, target: Object, key: string | Symbol) {
    assert.vm(vm);
    let PropNameToListenersMap;
    if (!TargetToPropsMap.has(target)) {
        PropNameToListenersMap = new Map();
        TargetToPropsMap.set(target, PropNameToListenersMap);
    } else {
        PropNameToListenersMap = TargetToPropsMap.get(target);
    }
    let set = PropNameToListenersMap.get(key);
    if (isUndefined(set)) {
        set = new Set();
        PropNameToListenersMap.set(key, set);
    }
    if (!set.has(vm)) {
        set.add(vm);
        // we keep track of the sets that vm is listening from to be able to do some clean up later on
        vm.listeners.add(set);
    }
}
