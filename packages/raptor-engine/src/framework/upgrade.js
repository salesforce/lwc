import assert from "./assert";
import { patch } from "./patch";
import { scheduleRehydration } from "./vm";
import { invokeComponentAttributeChangedCallback } from "./invoker";
import { updateComponentProp } from "./component";
import { getPropertyProxy } from "./properties";
import { getComponentDef } from "./def";
import { c } from "./api";
import { defineProperties, isUndefined } from "./language";
import { getPropNameFromAttrName } from "./utils";

const { getAttribute, setAttribute, removeAttribute } = Element.prototype;

function linkAttributes(element: HTMLElement, vm: VM) {
    assert.vm(vm);
    const { def: { props: propsConfig, observedAttrs } } = vm;
    // replacing mutators and accessors on the element itself to catch any mutation
    element.getAttribute = (attrName: string): string | null => {
        attrName = attrName.toLocaleLowerCase();
        const propName = getPropNameFromAttrName(attrName);
        if (propsConfig[propName]) {
            assert.logError(`Invalid attribute "${attrName}" for ${vm}. Instead access the public property with \`element.${propName};\`.`);
            return;
        }
        return getAttribute.call(element, attrName);
    };
    element.setAttribute = (attrName: string, newValue: any) => {
        attrName = attrName.toLocaleLowerCase();
        const propName = getPropNameFromAttrName(attrName);
        if (propsConfig[propName]) {
            assert.error(`Invalid attribute "${attrName}" for ${vm}. Instead update the public property with \`element.${propName} = value;\`.`);
            return;
        }
        const oldValue = getAttribute.call(element, attrName);
        setAttribute.call(element, attrName, newValue);
        newValue = getAttribute.call(element, attrName);
        if (attrName in observedAttrs && oldValue !== newValue) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
        }
    };
    element.removeAttribute = (attrName: string) => {
        attrName = attrName.toLocaleLowerCase();
        const propName = getPropNameFromAttrName(attrName);
        if (propsConfig[propName]) {
            assert.logError(`Invalid attribute "${attrName}" for ${vm}. Instead update the public property with \`element.${propName} = undefined;\`.`);
            return;
        }

        assert.block(function devModeCheck() {
            const propName = getPropNameFromAttrName(attrName);
            if (propsConfig[propName]) {
                updateComponentProp(vm, propName, newValue);
                if (vm.isDirty) {
                    console.log(`Scheduling ${vm} for rehydration.`);
                    scheduleRehydration(vm);
                }
            }
        });
        const oldValue = getAttribute.call(element, attrName);
        removeAttribute.call(element, attrName);
        const newValue = getAttribute.call(element, attrName);
        if (attrName in observedAttrs && oldValue !== newValue) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
        }
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
                return component[methodName].apply(component, arguments);
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
            set: (value: any) => {
                // proxifying before storing it is a must for public props
                value = typeof value === 'object' ? getPropertyProxy(value) : value;
                updateComponentProp(vm, propName, value);
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
    if (isUndefined(slotNames)) {
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
    if (isUndefined(Ctor)) {
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

/**
 * This method is almost identical to document.createElement
 * (https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement)
 * with the slightly difference that in the options, you can pass the `is`
 * property set to a Constructor instead of just a string value. E.g.:
 *
 * const el = createElement('x-foo', { is: FooCtor });
 *
 * If the value of `is` attribute is not a constructor,
 * then we fallback to the normal Web-Components workflow.
 */
export function createElement(tagName: string, options: any = {}): HTMLElement {
    const Ctor = typeof options.is === 'function' ? options.is : null;
    const element = document.createElement(tagName, Ctor ? null : options);

    if (Ctor && element instanceof HTMLElement) {
        upgradeElement(element, Ctor);
    }
    return element;
}

// TODO: how can a user dismount a component and kick in the destroy mechanism?
