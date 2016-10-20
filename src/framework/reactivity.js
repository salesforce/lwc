// @flow

import assert from "./assert.js";
import { addComponentWatchers } from "./watcher.js";
import { isRendering } from "./invoker.js";

export function makeComponentPropertiesActive(vm: VM) {
    assert.vm(vm);
    addComponentWatchers(vm);
}

export function makeComponentPropertiesInactive(vm: VM) {
    assert.vm(vm);
    const { listeners, reactiveNames } = vm;
    let entries = Object.getOwnPropertyNames(listeners);
    let len = entries.length;
    for (let i = 0; i < len; i += 1) {
        if (listeners[entries[i]]) {
            const [getters, get, setters, set] = listeners[entries[i]];
            let index = getters.indexOf(get);
            getters.splice(index, 1);
            index = getters.indexOf(set);
            setters.splice(index, 1);
            listeners[entries[i]] = null;
        }
    }
    entries = Object.getOwnPropertyNames(reactiveNames);
    len = entries.length;
    for (let i = 0; i < len; i += 1) {
        if (reactiveNames[entries[i]]) {
            reactiveNames[entries[i]] = false;
        }
    }
}

export function markEntryAsReactive(vm: VM, entry: string) {
    const { reactiveNames } = vm;
    if (!reactiveNames[entry]) {
        reactiveNames[entry] = true;
        console.log(`${vm}.${entry} property was marked as reactive.`);
    }
}

export function markEntryAsDirty(vm: VM, entry: string) {
    const { reactiveNames, flags } = vm;
    assert.isFalse(flags.isDirty, `markEntryAsDirty(${vm}, "${entry}") should not be called when the componet is already dirty.`);
    assert.isFalse(isRendering, `markEntryAsDirty(${vm}, "${entry}") cannot be called during rendering.`);
    if (reactiveNames[entry]) {
        console.log(`${vm}.${entry} property was marked as dirty.`);
        flags.isDirty = true;
    }
}
