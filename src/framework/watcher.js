import assert from "./assert.js";
import { scheduleRehydration } from "./hook.js";
import { markComponentAsDirty } from "./component.js";

const TargetToPropsMap = new WeakMap();

export function notifyListeners(target: Object, propName: string) {
    if (TargetToPropsMap.has(target)) {
        const PropNameToListenersMap = TargetToPropsMap.get(target);
        const set = PropNameToListenersMap.get(propName);
        if (set) {
            set.forEach((vm: VM) => {
                assert.vm(vm);
                console.log(`Marking ${vm} as dirty: "this.${propName}" set to a new value.`);
                if (!vm.cache.isDirty) {
                    markComponentAsDirty(vm);
                    console.log(`Scheduling ${vm} for rehydration.`);
                    scheduleRehydration(vm);
                }
            });
        }
    }
}

export function subscribeToSetHook(vm: VM, target: Object, propName: string) {
    assert.vm(vm);
    let PropNameToListenersMap;
    if (!TargetToPropsMap.has(target)) {
        PropNameToListenersMap = new Map();
        TargetToPropsMap.set(target, PropNameToListenersMap);
    } else {
        PropNameToListenersMap = TargetToPropsMap.get(target);
    }
    let set = PropNameToListenersMap.get(propName);
    if (!set) {
        set = new Set();
        PropNameToListenersMap.set(propName, set);
    }
    if (!set.has(vm)) {
        set.add(vm);
        // we keep track of the sets that vm is listening from to be able to do some clean up later on
        vm.cache.listeners.add(set);
    }
}
