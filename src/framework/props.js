//<reference path="types.d.ts"/>

import assert from "./assert.js";
import { markVMAsDirty } from "./reactivity.js";
import { scheduleRehydration } from "./patcher.js";
import {
    isRendering,
} from "./invoker.js";
import {
    getAttributeProxy,
    updateAttributeValueFromProp,
} from "./attributes.js";
import { internal } from "./def.js";

export function initComponentProps(vm: VM, newProps: Object, newBody: Array<Object>) {
    const { component, state, flags, def: { props: config } } = vm;
    const target = Object.getPrototypeOf(component);
    for (let propName in config) {
        let { initializer } = config[propName];
        assert.block(() => {
            const { get, set } = Object.getOwnPropertyDescriptor(component, propName) || Object.getOwnPropertyDescriptor(target, propName);
            assert.invariant(get[internal] && set[internal], `component ${vm} has tampered with decorated @prop ${propName} during construction.`);
        });
        Object.defineProperty(component, propName, {
            get: (): any => {
                const value = state[propName];
                return (value && typeof value === 'object') ? getAttributeProxy(value) : value;
            },
            set: () => {
                assert.fail(`Component ${vm} can not set a new value for decorated @prop ${propName}.`);
            },
            configurable: true,
            enumerable: true,
        });
        // default prop value computed when needed
        state[propName] = propName in newProps ? newProps[propName] : (typeof initializer === 'function' ? initializer(): initializer);
    }
    flags.hasBodyAttribute = 'body' in config;
    if (newBody && newBody.length > 0) {
        state.body = newBody;
    }
    assert.block(() => {
        for (let propName in newProps) {
            assert.isTrue(propName in config, `Component ${vm} does not have decorated @prop ${propName}.`);
        }
        Object.preventExtensions(state);
    });
}

export function batchUpdateComponentProps(vm: VM, newProps: Object, newBody: Array<Object>) {
    const { flags: { hasBodyAttribute }, state, def: { props: config } } = vm;
    assert.invariant(!isRendering, `${vm}.render() method has side effects on the state of the component.`);
    for (let propName in config) {
        updateComponentProp(vm, propName, propName in newProps ? newProps[propName] : null);
    }
    if (hasBodyAttribute) {
        // TODO: should body really be a slot?
        updateComponentProp(vm, "body", newBody && newBody.length > 0 ? newBody : null);
    }
    assert.block(() => {
        for (let propName in state) {
            assert.isTrue(propName in config, `Component ${vm} does not have decorated @prop ${propName}.`);
        }
    });
}

function updateComponentProp(vm: VM, propName: string, newValue: any) {
    const { flags, state, def: { props: config } } = vm;
    assert.invariant(!isRendering, `${vm}.render() method has side effects on the state of ${vm}.${propName}`);
    assert.isTrue(config.hasOwnProperty(propName), `Invalid property name ${propName} of ${vm}.`);
    if (newValue === null) {
        // default prop value computed when needed
        const initializer = config[propName].initializer;
        newValue = typeof initializer === 'function' ? initializer() : initializer;
    }
    let oldValue = state[propName];
    if (oldValue !== newValue) {
        state[propName] = newValue;
        updateAttributeValueFromProp(vm, propName, oldValue, newValue);
        if (!flags.isDirty) {
            markVMAsDirty(vm);
        }
    }
}

export function updateComponentPropAndRehydrateWhenNeeded(vm: VM, propName: string, newValue: any) {
    const { flags } = vm;
    updateComponentProp(vm, propName, newValue);
    if (flags.isDirty) {
        scheduleRehydration(vm);
    }
}
