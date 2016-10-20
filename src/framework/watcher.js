// @flow

import assert from "./assert.js";
import { scheduleRehydration } from "./patcher.js";
import {
    isRendering,
    vmBeingRendered,
} from "./invoker.js";
import {
    markVMAsDirty,
} from "./reactivity.js";

const WatcherFlag = Symbol('watcher');
const TargetToPropsMap = new WeakMap();

function notifyListeners(target: Object, propName: string) {
    if (TargetToPropsMap.has(target)) {
        const PropNameToListenersMap = TargetToPropsMap.get(target); 
        if (PropNameToListenersMap.has(propName)) {
            const set = PropNameToListenersMap.get(propName);
            set.forEach((vm: VM) => {
                assert.vm(vm);
                const { flags } = vm;
                if (!flags.isDirty) {
                    markVMAsDirty(vm);
                    scheduleRehydration(vm);
                }
            });
        }
    }
}

function getWatchPropertyDescriptor(target: Object, propName: string, originalGetter: Function, originalSetter: Function): PropertyDescriptor {
    let { enumerable, value: oldValue } = Object.getOwnPropertyDescriptor(target, propName);
    let isFirstTimeGetterIsCalled = true;
    const get = function reactiveGetter(): any {
        const value = originalGetter ? originalGetter.call(this) : undefined;
        if (isRendering) {
            subscribeToSetHook(vmBeingRendered, target, propName);
            if (oldValue !== value || isFirstTimeGetterIsCalled) {
                if (value !== null && typeof value === 'object') {
                    Object.getOwnPropertyNames(value).forEach((propName: string): any => watchProperty(value, propName));
                }
            }
        }
        isFirstTimeGetterIsCalled = false;
        oldValue = value;
        return value;
    };
    const set = function reactiveSetter(newValue: any) {
        assert.invariant(!isRendering, `Invalid attempting to mutate property ${propName} of ${target} during an ongoing rendering process for ${vmBeingRendered}.`);
        if (originalSetter && newValue !== oldValue) {
            originalSetter.call(this, newValue);
            notifyListeners(target, propName);
        }
    };
    get[WatcherFlag] = 1;
    set[WatcherFlag] = 1;
    return {
        get,
        set,
        configurable: true,
        enumerable,
    };
}

export function watchProperty(target: Object, propName: string): Boolean {
    // TODO: maybe this should only work if target is a plain object
    let { get, set, value, configurable } = Object.getOwnPropertyDescriptor(target, propName);
    if (get && WatcherFlag in get) {
        return true;
    }
    if (configurable) {
        if (!get && !set) {
            get = (): any => value;
            set = (newValue: any) => {
                if (value !== newValue) {
                    value = newValue;
                }
            };
        }
        let descriptor = getWatchPropertyDescriptor(target, propName, get, set);
        Object.defineProperty(target, propName, descriptor);
        return true;
    }
    return false;
}

export function subscribeToSetHook(vm: VM, target: Object, propName: string) {
    assert.vm(vm);
    if (watchProperty(target, propName)) {
        if (!TargetToPropsMap.has(target)) {
            TargetToPropsMap.set(target, new Map());
        }
        const PropNameToListenersMap = TargetToPropsMap.get(target);

        if (!PropNameToListenersMap.has(propName)) {
            PropNameToListenersMap.set(propName, new Set());
        }
        const set = PropNameToListenersMap.get(propName);

        if (!set.has(vm)) {
            set.add(vm);
            // we keep track of the sets that vm is listening from to be able to do some clean up later on
            vm.listeners.add(set);
        }
    }
}
