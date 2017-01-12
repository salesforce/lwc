import assert from "./assert.js";
import { markVMAsDirty } from "./reactivity.js";
import { scheduleRehydration } from "./patcher.js";
import {
    isRendering,
    invokeComponentAttributeChangedCallback,
} from "./invoker.js";
import {
    getAttributeProxy,
} from "./attributes.js";
import { internal } from "./def.js";

export const BODY_PROPERTY_NAME = "body";

export function initComponentProps(vm: VM, newProps: Object, newBody: void | Array<String | VNode>) {
    const { component, state, flags, def: { props: config, observedAttrs } } = vm;
    const target = Object.getPrototypeOf(component);
    for (let propName in config) {
        assert.block(() => {
            const { get, set } = Object.getOwnPropertyDescriptor(component, propName) || Object.getOwnPropertyDescriptor(target, propName);
            assert.invariant(get[internal] && set[internal], `component ${vm} has tampered with property ${propName} during construction.`);
        });
        Object.defineProperty(component, propName, {
            get: (): any => {
                const value = state[propName];
                return (value && typeof value === 'object') ? getAttributeProxy(value) : value;
            },
            set: () => {
                assert.fail(`Component ${vm} can not set a new value for property ${propName}.`);
            },
            configurable: true,
            enumerable: true,
        });
    }
    // TODO: maybe we should follow the web-components algos here.
    // after finishing the setup up of all props, we need to set the default values and update the DOM as well
    for (let propName in config) {
        const { initializer, attrName } = config[propName];
        // default prop value computed when needed
        const newValue = propName in newProps ? newProps[propName] : (typeof initializer === 'function' ? initializer(): initializer);
        state[propName] = newValue;
        updateDomAttributeValueIfNeeded(vm, attrName, newValue);
        // at this point, we should notify the user that something has changed in the state
        if (observedAttrs[attrName] && newValue !== undefined) {
            invokeComponentAttributeChangedCallback(vm, attrName, undefined, newValue);
        }
    }
    flags.hasBodyAttribute = BODY_PROPERTY_NAME in config;
    if (newBody && newBody.length > 0) {
        state[BODY_PROPERTY_NAME] = newBody;
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

function updateDomAttributeValueIfNeeded(vm: VM, attrName: string, newValue: any) {
    const { data } = vm;
    if (!data.attrs) {
        data.attrs = {};
    }
    // Updating the DOM attributes
    // TODO: not all attributes should be reflected
    // and not all value types should be reflected.
    data.attrs[attrName] = newValue;
}

function updateComponentProp(vm: VM, propName: string, newValue: any) {
    const { flags, state, def: { props: config, observedAttrs } } = vm;
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
        if (flags.hasElement) {
            const attrName = config[propName].attrName;
            if (observedAttrs[attrName]) {
                invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
            }
            updateDomAttributeValueIfNeeded(vm, attrName, newValue);
        }
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
