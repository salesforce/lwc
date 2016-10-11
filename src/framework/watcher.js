// @flow

import assert from "./assert.js";
import { scheduleRehydration } from "./patcher.js";
import { getAttributesConfig } from "./attribute.js";
import {
    markEntryAsReactive,
    markEntryAsDirty,
} from "./reactivity.js";

const watchers = Symbol();

function getWatchPropertyDescriptor(target: Object, propName: string, originalGetter: Function, originalSetter: Function): PropertyDescriptor {
    let { enumerable, value: oldValue } = Object.getOwnPropertyDescriptor(target, propName);
    let isFirstTimeGetterIsCalled = true;
    const get = function reactiveGetter(): any {
        const value = originalGetter ? originalGetter.call(this) : undefined;
        if (oldValue !== value || isFirstTimeGetterIsCalled) {
            if (value !== null && typeof value === 'object') {
                Object.getOwnPropertyNames(value).forEach((propName: string): any => watchProperty(value, propName));
            }
        }
        isFirstTimeGetterIsCalled = false;
        oldValue = value;
        const callbacks = reactiveGetter[watchers];
        const len = callbacks.length;
        for (let i = 0; i < len; i += 1) {
            callbacks[i](value);
        }
        return value;
    };
    const set = function reactiveSetter(newValue: any) {
        if (originalSetter && newValue !== oldValue) {
            originalSetter.call(this, newValue);
            const callbacks = reactiveSetter[watchers];
            const len = callbacks.length;
            for (let i = 0; i < len; i += 1) {
                callbacks[i](newValue);
            }
        }
    };
    const getters = [];
    Object.defineProperty(get, watchers, {
        value: getters,
        enumerable: false,
        configurable: false,
        writable: false,
    });
    const setters = [];
    Object.defineProperty(set, watchers, {
        value: setters,
        enumerable: false,
        configurable: false,
        writable: false,
    });
    return {
        get,
        set,
        configurable: true,
        enumerable,
    };
}

function watchProperty(target: Object, propName: string): Boolean {
    let { get, set, value, configurable } = Object.getOwnPropertyDescriptor(target, propName);
    if (get && watchers in get) {
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

function addPropertyListener(target: Object, propName: string, getPropertyCallback: Function, setPropertyCallback: Function): array<array<Function>>|void {
    let { get, set } = Object.getOwnPropertyDescriptor(target, propName);
    assert.invariant(get && get[watchers], `addPropertyListener(${target}, "${propName}") cannot be called because it is not being watched.`);
    const getters = get[watchers];
    const setters = set[watchers];
    getters.push(getPropertyCallback);
    setters.push(setPropertyCallback);
    return [getters, setters];
}

function setPropertyWatcher(vm: VM, target: Object, propName: string, ns: string, isAttribute: boolean) {
    assert.vm(vm);
    const entry = ns ? `${ns}.${propName}` : propName;
    const { flags, listeners } = vm;
    if (listeners[entry]) {
        return;
    }
    if (watchProperty(target, propName)) {
        const getPropertyCallback = (value: any) => {
            if (flags.isRendering) {
                markEntryAsReactive(vm, entry);
                if (value !== null && typeof value === 'object') {
                    Object.getOwnPropertyNames(value).forEach((propName: string) => {
                        setPropertyWatcher(vm, value, propName, entry, isAttribute);
                    });
                }
            }
        };
        const setPropertyCallback = () => {
            assert.invariant(!flags.isRendering, `${vm}.render() method has side effects on the property ${propName}.`);
            assert.invariant(entry.charAt(0) !== '@', `Component ${target} can not set a new value for decorated @attribute ${propName}.`);
            if (!flags.isDirty) {
                markEntryAsDirty(vm, entry);
                if (flags.isDirty) {
                    scheduleRehydration(vm);
                }
            }
        };
        const [getters, setters] = addPropertyListener(target, propName, getPropertyCallback, setPropertyCallback);
        listeners[entry] = [getters, getPropertyCallback, setters, setPropertyCallback];
    }
}

export function addComponentWatchers(vm: VM) {
    assert.vm(vm);
    const { component } = vm;
    let attributes = getAttributesConfig(Object.getPrototypeOf(component));
    Object.getOwnPropertyNames(component).forEach((propName: string) => {
        setPropertyWatcher(vm, component, propName, '', propName in attributes);
    });
}
