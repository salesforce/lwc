// @flow

///<reference path="types.d.ts"/>

import assert from "./assert.js";
import { markEntryAsDirty } from "./reactivity.js";
import { scheduleRehydration } from "./patcher.js"; 

export const set = Symbol('setter symbol to force render() to happen');

export function addComponentSetHook(vm: VM) {
    const { component, flags } = vm;
    // special hook for forcing to render() the component:
    //
    //      import { set } from "aura";
    //      this[set]("foo", 1);
    //
    Object.defineProperty(component, set, {
        value: (propName: string, newValue: any) => {
            assert.invariant(!flags.isRendering, `${vm}.render() method has side effects on the property ${propName}. You cannot call ${vm}[set](...) during the render phase.`);
            console.log(`${vm}[set]("${propName}", ${newValue}) was invoked.`);
            let value = component[propName];
            if (value !== newValue) {
                component[propName] = newValue;
            }
            if (!flags.isDirty) {
                markEntryAsDirty(vm, propName);
                if (flags.isDirty) {
                    scheduleRehydration(vm);
                }
            }
        },
        enumerable: false,
        configuration: false,
    });
}
