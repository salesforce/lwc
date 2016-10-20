// @flow

///<reference path="types.d.ts"/>

import assert from "./assert.js";
import { markVMAsDirty } from "./reactivity.js";
import { scheduleRehydration } from "./patcher.js";
import { isRendering } from "./invoker.js";

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
            assert.invariant(!isRendering, `${vm}.render() method has side effects on the property ${propName}. You cannot call ${vm}[set](...) during the render phase.`);
            assert.isTrue(propName in component, `${vm}.${propName} is not defined yet. You cannot call ${vm}[set]("${propName}", ...) without previously defining ${propName} property in ${vm}'s constructor.`);
            console.log(`${vm}[set]("${propName}", ${newValue}) was invoked.`);
            let value = component[propName];
            if (value !== newValue) {
                component[propName] = newValue;
            }
            if (!flags.isDirty) {
                markVMAsDirty(vm, propName);
                scheduleRehydration(vm);
            }
        },
        enumerable: false,
        configurable: false,
    });
}
