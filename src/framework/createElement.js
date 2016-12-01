// @flow

import assert from "./assert.js";
import { h, v } from "./api.js";
import {
    setAttribute,
    removeAttribute,
    hasAttribute,
    getAttribute,
} from "./attributes.js";
import { updateComponentPropAndRehydrateWhenNeeded } from "./props.js";
import { patch } from "./patcher.js";

const WebComponentPublicAPI = {
    hasAttribute,
    getAttribute,
    setAttribute,
    removeAttribute,
};

const RaptorElementProxy = {
    get(vm: VM, propName: string): any {
        assert.vm(vm);
        const { def: { props, methods }, component } = vm;
        if (props.hasOwnProperty(propName) ||  methods.hasOwnProperty(propName)) {
            return component[propName];
        } else if (WebComponentPublicAPI.hasOwnProperty(propName)) {
            return function(...args: Array): any {
                return WebComponentPublicAPI[propName].apply(this, [vm, ...args]);
            }
        }
    },
    set(vm: VM, propName: string, newValue: any): boolean {
        assert.vm(vm);
        const { def: { props } } = vm;
        if (props.hasOwnProperty(propName)) {
            updateComponentPropAndRehydrateWhenNeeded(vm, propName, newValue);
            return true;
        } else {
            assert.fail(`Property name ${propName} cannot be set to ${newValue} for component ${vm}.`);
        }
        return false;
    },
    defineProperty(vm: VM, propName: string, descriptor: PropertyDescriptor): boolean {
        assert.vm(vm);
        assert.fail(`Property name ${propName} cannot be defined as ${descriptor} for component ${vm}.`);
        return false;
    },
    deleteProperty(vm: VM, propName: string): boolean {
        assert.vm(vm);
        assert.fail(`Property name ${propName} cannot be deleted for component ${vm}.`);
        return false;
    },
    has(vm: VM, propName: string): boolean {
        assert.vm(vm);
        const { def: { props } } = vm;
        return props.hasOwnProperty(propName);
    },
    ownKeys(vm: VM): Array {
        assert.vm(vm);
        const { def: { props } } = vm;
        return Object.getOwnPropertyNames(props);
    },
    getOwnPropertyDescriptor(vm: VM, propName: string): PropertyDescriptor {
        assert.vm(vm);
        const { def: { props, methods }, component } = vm;
        if (methods.hasOwnProperty(propName)) {
            return {
                value: component[propName],
                writable: false,
                enumerable: false,
                configurable: false
            };
        } else if (props.hasOwnProperty(propName)) {
            return {
                value: component[propName],
                writable: true,
                enumerable:true,
                configurable: false
            }
        }
    },
    isExtensible(vm: VM): boolean {
        assert.vm(vm);
        return false;
    },
    getPrototypeOf(vm: VM) {
        assert.vm(vm);
    },
    setPrototypeOf(vm: VM, prototype: any): boolean {
        assert.vm(vm);
        assert.fail(`The prototype of ${vm} cannot be changed to ${prototype}.`);
        return false;
    },
};

export const ObjectElementToVMMap = new WeakMap();

const fakeElement = document.createElement('raptor'); // fake element to patch and resolve vnode.elm

export default function createElement(ComponentCtorOrTagName: any): RaptorElement {
    const isHTMLTagName = typeof ComponentCtorOrTagName === "string";
    /**
     * Snabdom does not have a way to process the vnode to produce an element, instead we need to
     * patch the vnode against some fake html element, then we can inspect the element. More here:
     * https://github.com/snabbdom/snabbdom/issues/156
     */
    const vnode = patch(fakeElement.cloneNode(), (isHTMLTagName ? h : v)(ComponentCtorOrTagName));
    const element = isHTMLTagName ? vnode.elm : new Proxy(vnode, RaptorElementProxy);
    ObjectElementToVMMap.set(element, vnode);
    return element;
}
