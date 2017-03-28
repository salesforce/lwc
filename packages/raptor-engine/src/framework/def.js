/**
 * This module is responsible for producing the ComponentDef object that is always
 * accessible via `vm.def`. This is lazily created during the creation of the first
 * instance of a component class, and shared across all instances.
 *
 * This structure can be used to synthetically create proxies, and understand the
 * shape of a component. It is also used internally to apply extra optimizations.
 */

import assert from "./assert.js";
import {
    freeze,
    create,
    isUndefined,
    defineProperties,
    getOwnPropertyDescriptor,
    getOwnPropertyNames,
} from "./language.js";
import { GlobalHTMLProperties } from "./dom.js";
import { getPropertyProxy } from "./properties.js";
import { getLinkedVNode } from "./vm.js";
import { Element } from "./html-element.js";

const CtorToDefMap = new WeakMap();
const EmptyObject = Object.freeze(Object.create(null));

function isElementComponent(Ctor: any, protoSet?: Set = new Set()): boolean {
    if (!Ctor && protoSet.has(Ctor)) {
        return false; // null, undefined, or circular prototype definition
    }
    const proto = Object.getPrototypeOf(Ctor);
    if (proto === Element) {
        return true;
    }
    protoSet.add(Ctor);
    return isElementComponent(proto, protoSet);
}

export function getComponentDef(Ctor: Class<Component>): ComponentDef {
    if (CtorToDefMap.has(Ctor)) {
        return CtorToDefMap.get(Ctor);
    }
    const isStateful = isElementComponent(Ctor);
    assert.isTrue(Ctor.constructor, `Missing ${Ctor.name}.constructor, ${Ctor.name} should have a constructor property.`);
    const name: string = Ctor.name;
    assert.isTrue(name, `${Ctor} should have a name property.`);
    const props = getPropsHash(Ctor);
    if (isStateful) {
        const proto = Ctor.prototype;
        for (let propName in props) {
            // initializing getters and setters for each public props on the target prototype
            assert.invariant(!getOwnPropertyDescriptor(proto, propName), `Invalid ${name}.prototype.${propName} definition, it cannot be a prototype definition if it is a public property, use the constructor to define it instead.`);
            defineProperties(proto, createPublicPropertyDescriptorMap(propName));
        }
    }
    const methods = isStateful ? getMethodsHash(Ctor) : EmptyObject;
    const observedAttrs = isStateful ? getObservedAttrsHash(Ctor) : EmptyObject;
    const def = {
        name,
        isStateful,
        props,
        methods,
        observedAttrs,
    };
    assert.block(() => {
        freeze(Ctor);
        freeze(Ctor.prototype);
        freeze(def);
        freeze(props);
        freeze(methods);
        freeze(observedAttrs);
    });
    CtorToDefMap.set(Ctor, def);
    return def;
}

function createPublicPropertyDescriptorMap(propName: string): PropertyDescriptorMap {
    const descriptors = {};
    function getter(): any {
        const vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        const { vm } = vnode;
        assert.vm(vm);
        const { cmpProps, component } = vm;
        if (isUndefined(component)) {
            assert.logError(`You should not attempt to read the value of public property ${propName} in "${vm}" during the construction process because its value has not been set by the owner component yet. Use the constructor to set default values for each public property.`);
            return;
        }
        const value = cmpProps[propName];
        return (value && typeof value === 'object') ? getPropertyProxy(value) : value;
    }
    function setter(newValue: any) {
        const vnode = getLinkedVNode(this);
        assert.vnode(vnode);
        const { vm } = vnode;
        assert.vm(vm);
        const { cmpProps, component } = vm;
        if (component) {
            assert.logError(`Component "${vm}" can only be set to a new value for public property ${propName} during construction.`);
            return;
        }
        cmpProps[propName] = newValue;
    }
    descriptors[propName] = {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true,
    };
    return descriptors;
}

function getPropsHash(target: Object): HashTable<PropDef> {
    const props: HashTable = target.publicProps || {};
    if (!props || !getOwnPropertyNames(props).length) {
        return EmptyObject;
    }
    return getOwnPropertyNames(props).reduce((propsHash: HashTable<PropDef>, propName: string): HashTable<PropDef> => {
        assert.block(() => {
            if (GlobalHTMLProperties[propName] && GlobalHTMLProperties[propName].attribute) {
                const { error, attribute, experimental } = GlobalHTMLProperties[propName];
                const msg = [];
                if (error) {
                    msg.push(error);
                } else if (experimental) {
                    msg.push(`Writing logic that relies on experimental property \`${propName}\` is discouraged, until this feature is standarized and supported by all evergreen browsers. Property \`${propName}\` and attribute "${attribute}" will be ignored by this engine to prevent you from producing non-standard components.`);
                } else {
                    // TODO: this only applies to stateful components, need more details.
                    msg.push(`Re-defining a reserved global HTML property \`${propName}\` is not allowed in Component "${target.name}". You cannot access to the value of the global property directly, but since this property is reflective of attribute "${attribute}", you have two options to can access to the attribute value:`);
                    msg.push(`  * Use \`this.getAttribute("${attribute}")\` to access the attribute value at any given time. This option is more suitable for accessing the value in a getter during the rendering process.`);
                    msg.push(`  * Declare \`static observedAttributes = ["${attribute}"]\` and then use the \`attributeChangedCallback(attrName, oldValue, newValue)\` to get a notification every time the attribute "${attribute}" changes. This option is more suitable for reactive programming, e.g.: fetching new content every time the attribute is updated.`);
                }
                console.error(msg.join('\n'));
            }
        });
        propsHash[propName] = 1;
        return propsHash;
    }, create(null));
}

function getMethodsHash(target: Object): HashTable<number> {
    const publicMethods = target.publicMethods;
    if (!publicMethods || !publicMethods.length) {
        return EmptyObject;
    }
    return publicMethods.reduce((methodsHash: HashTable, methodName: string): HashTable => {
        methodsHash[methodName] = 1;
        assert.block(() => {
            assert.isTrue(typeof target.prototype[methodName] === 'function', `Component "${target.name}" should have a method \`${methodName}\` instead of ${target.prototype[methodName]}.`);
            freeze(target.prototype[methodName]);
        });
        return methodsHash;
    }, create(null));
}

function getObservedAttrsHash(target: Object): HashTable<number> {
    // To match WC semantics, only if you have the callback in the prototype, you
    if (!target.prototype.attributeChangedCallback || !target.observedAttributes || !target.observedAttributes.length) {
        return EmptyObject;
    }
    return target.observedAttributes.reduce((observedAttributes: HashTable, attrName: string): HashTable => {
        observedAttributes[attrName] = 1;
        return observedAttributes;
    }, create(null));
}
