import assert from "./assert.js";
import { patch } from "./patch.js";
import { scheduleRehydration } from "./vm.js";
import { invokeComponentAttributeChangedCallback } from "./invoker.js";
import {
    resetComponentProp,
    updateComponentProp,
} from "./component.js";
import { getComponentDef } from "./def.js";
import { c } from "./api.js";
import { loaderImportMethod } from "./loader.js";
import { defineProperties } from "./language.js";

const { getAttribute, setAttribute, removeAttribute } = Element.prototype;
const CAMEL_REGEX = /-([a-z])/g;
const attrNameToPropNameMap = {};

function getPropNameFromAttrName(attrName: string): string {
    let propName = attrNameToPropNameMap[attrName];
    if (!propName) {
        propName = attrName.replace(CAMEL_REGEX, (g: string): string => g[1].toUpperCase());
        attrNameToPropNameMap[attrName] = propName;
    }
    return propName;
}

function linkAttributes(element: HTMLElement, vm: VM) {
    assert.vm(vm);
    const { def: { props: propsConfig, observedAttrs } } = vm;
    // replacing mutators on the element itself to catch any mutation
    element.setAttribute = (attrName: string, newValue: any) => {
        attrName = attrName.toLocaleLowerCase();
        const propName = getPropNameFromAttrName(attrName);
        if (propsConfig[propName]) {
            updateComponentProp(vm, propName, newValue);
            if (vm.isDirty) {
                console.log(`Scheduling ${vm} for rehydration.`);
                scheduleRehydration(vm);
            }
        } else if (observedAttrs[attrName]) {
            const oldValue = getAttribute.call(element, attrName);
            newValue = newValue + ''; // by spec, attribute values must be string values.
            if (newValue !== oldValue) {
                invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
            }
        }
        setAttribute.call(element, attrName, newValue);
    };
    element.removeAttribute = (attrName: string) => {
        attrName = attrName.toLocaleLowerCase();
        const propName = getPropNameFromAttrName(attrName);
        if (propsConfig[propName]) {
            resetComponentProp(vm, propName);
            if (vm.isDirty) {
                console.log(`Scheduling ${vm} for rehydration.`);
                scheduleRehydration(vm);
            }
        } else if (observedAttrs[attrName]) {
            const oldValue = getAttribute.call(element, attrName);
            if (oldValue !== null) {
                invokeComponentAttributeChangedCallback(vm, attrName, oldValue, null);
            }
        }
        removeAttribute.call(element, attrName);
    };
}

function linkProperties(element: HTMLElement, vm: VM) {
    assert.vm(vm);
    const { component, def: { props: propsConfig, methods } } = vm;
    const descriptors: PropertyDescriptorMap = {};
    // linking public methods
    for (let methodName in methods) {
        descriptors[methodName] = {
            value: function (): any {
                return component[methodName](...arguments);
            },
            configurable: false,
            writable: false,
            enumerable: false,
        };
    }
    // linking reflective properties
    for (let propName in propsConfig) {
        descriptors[propName] = {
            get: (): any => component[propName],
            set: (newValue: any) => {
                updateComponentProp(vm, propName, newValue);
                if (vm.isDirty) {
                    console.log(`Scheduling ${vm} for rehydration.`);
                    scheduleRehydration(vm);
                }
            },
            configurable: false,
            enumerable: true,
        };
    }
    defineProperties(element, descriptors);
}

function getInitialProps(element: HTMLElement, Ctor: Class<Component>): HashTable<any> {
    const { props: config } = getComponentDef(Ctor);
    const props = {};
    for (let propName in config) {
        if (propName in element) {
            props[propName] = element[propName];
        }
    }
    return props;
}

function getInitialSlots(element: HTMLElement, Ctor: Class<Component>): HashTable<any> {
    const { slotNames } = getComponentDef(Ctor);
    if (!slotNames) {
        return;
    }
    // TODO: implement algo to resolve slots
    return undefined;
}

/**
 * This algo mimics 2.5 of web component specification somehow:
 * https://www.w3.org/TR/custom-elements/#upgrades
 */
function upgradeElement(element: HTMLElement, Ctor: Class<Component>) {
    if (!Ctor) {
        throw new TypeError(`Invalid Component Definition: ${Ctor}.`);
    }
    const props = getInitialProps(element, Ctor);
    const slotset = getInitialSlots(element, Ctor);
    const tagName = element.tagName.toLowerCase();
    const vnode = c(tagName, Ctor, { props, slotset, className: element.className || undefined });
    vnode.isRoot = true;
    // TODO: eventually after updating snabbdom we can use toVNode(element)
    // as the first argument to reconstruct the vnode that represents the
    // current state.
    const { vm } = patch(element, vnode);
    linkAttributes(element, vm);
    // TODO: for vnode with element we might not need to do any of these.
    linkProperties(element, vm);
}

function upgrade(element: HTMLElement, CtorOrPromise: Promise<Class<Component>> | Class<Component>): Promise<HTMLElement> {
    return new Promise((resolve: (element: HTMLElement) => void, reject: (e: Error) => void) => {
        assert.isTrue(element instanceof HTMLElement, `upgrade() first argument should be a DOM Element instead of ${element}.`);
        const p = Promise.resolve(CtorOrPromise);
        p.then((Ctor: Class<Component>) => {
            upgradeElement(element, Ctor);
            resolve(element);
        }, reject);
    });
}

const definedElements = {};

/**
 * This method is almost identical to document.createElement
 * (https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement)
 * with the slightly difference that in the options, you can pass the `is`
 * property set to a Constructor instead of just a string value. E.g.:
 *
 * const el = createElement('x-foo', { is: FooCtor });
 *
 * If the value of `is` attribute is a string and there is a registered WC,
 * then we fallback to the normal Web-Components workflow.
 * If the value of `is` attribute is a string and there is not a registered WC,
 * or the value of `is` attribute is not set at all, then we attempt to resolve
 * it from the registry.
 */
export function createElement(tagName: string, options?: any): HTMLElement {
    let CtorPromise;
    const is = options && options.is && options.is;
    if (is) {
        if (typeof is === 'function') {
            CtorPromise = Promise.resolve(is);
            options = undefined;
        } else if (typeof is === 'string' && !(is in definedElements)) {
            // it must be a component, lets derivate the namespace from `is`,
            // where only the first `-` should be replaced
            CtorPromise = loaderImportMethod(is.toLowerCase().replace('-', ':'));
            options = undefined;
        }
    } else if (!(tagName in definedElements)) {
        // it must be a component, lets derivate the namespace from tagName,
        // where only the first `-` should be replaced
        CtorPromise = loaderImportMethod(tagName.toLowerCase().replace('-', ':'));
    }
    const element = document.createElement(tagName, options);
    if (!CtorPromise || !(element instanceof HTMLElement)) {
        return element;
    }
    // TODO: maybe a local hash of resolved modules to speed things up.
    upgrade(element, CtorPromise).catch((e: Error) => {
        console.error(`Error trying to upgrade element <${element.tagName.toLowerCase()}>. ${e}`);
    });
    return element;
}

try {
    if (typeof customElements !== undefined && customElements.define) {
        const defineOriginal = customElements.define;
        customElements.define = function (tagName: string) {
            defineOriginal.call(this, ...arguments);
            definedElements[tagName] = undefined;
        }
    }
} catch (e) {
    console.warn(`customElements.define cannot be redefined. ${e}`);
}
