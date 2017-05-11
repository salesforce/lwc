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
    ArrayIndexOf,
    toString,
    ArrayPush,
    defineProperty,
    defineProperties,
    getOwnPropertyDescriptor,
    getOwnPropertyNames,
} from "./language.js";
import { GlobalHTMLProperties } from "./dom.js";
import { Element, createPublicPropertyDescriptorMap } from "./html-element.js";
import { EmptyObject } from "./utils.js";

const CtorToDefMap: Map<any, ComponentDef> = new WeakMap();

function isElementComponent(Ctor: any, protoSet?: Array<any>): boolean {
    protoSet = protoSet || [];
    if (!Ctor || ArrayIndexOf.call(protoSet, Ctor) >= 0) {
        return false; // null, undefined, or circular prototype definition
    }
    const proto = Object.getPrototypeOf(Ctor);
    if (proto === Element) {
        return true;
    }
    ArrayPush.call(protoSet, Ctor);
    return isElementComponent(proto, protoSet);
}

function createComponentDef(Ctor: Class<Component>): ComponentDef {
    const isStateful = isElementComponent(Ctor);
    const name: string = Ctor.name;
    assert.isTrue(name && typeof name === 'string', `${toString(Ctor)} should have a "name" property with string value, but found ${name}.`);
    assert.isTrue(Ctor.constructor, `Missing ${name}.constructor, ${name} should have a "constructor" property.`);
    const props = getPublicPropertiesHash(Ctor);
    if (isStateful) {
        const proto = Ctor.prototype;
        for (let propName in props) {
            // initializing getters and setters for each public prop on the target prototype
            assert.invariant(!getOwnPropertyDescriptor(proto, propName), `Invalid ${name}.prototype.${propName} definition, it cannot be a prototype definition if it is a public property. Instead use the constructor to define it.`);
            defineProperties(proto, createPublicPropertyDescriptorMap(propName));
        }
    } else {
        // TODO: update when functionals are supported
        throw new TypeError(`${name} is not an Element. Only components extending Element from "engine" are supported. In the future functional components will be supported.`);
    }
    const methods = isStateful ? getPublicMethodsHash(Ctor) : EmptyObject;
    const observedAttrs = isStateful ? getObservedAttributesHash(Ctor) : EmptyObject;
    const def: ComponentDef = {
        name,
        isStateful,
        props,
        methods,
        observedAttrs,
    };
    assert.block(function devModeCheck() {
        freeze(Ctor.prototype);
        freeze(props);
        freeze(methods);
        freeze(observedAttrs);
        for (let key in def) {
            defineProperty(def, key, {
                configurable: false,
                writable: false,
            });
        }
    });
    return def;
}

function getPublicPropertiesHash(target: Object): HashTable<PropDef> {
    const props: HashTable = target.publicProps || {};
    if (!props || !getOwnPropertyNames(props).length) {
        return EmptyObject;
    }
    return getOwnPropertyNames(props).reduce((propsHash: HashTable<PropDef>, propName: string): HashTable<PropDef> => {
        assert.block(function devModeCheck() {
            if (GlobalHTMLProperties[propName] && GlobalHTMLProperties[propName].attribute) {
                const { error, attribute, experimental } = GlobalHTMLProperties[propName];
                const msg = [];
                if (error) {
                    msg.push(error);
                } else if (experimental) {
                    msg.push(`"${propName}" is an experimental property that is not standardized or supported by all browsers. Property "${propName}" and attribute "${attribute}" are ignored.`);
                } else {
                    msg.push(`"${propName}" is a global HTML property. Instead access it via the reflective attribute "${attribute}" with one of these techniques:`);
                    msg.push(`  * Use \`this.getAttribute("${attribute}")\` to access the attribute value. This option is best suited for accessing the value in a getter during the rendering process.`);
                    msg.push(`  * Declare \`static observedAttributes = ["${attribute}"]\` and use \`attributeChangedCallback(attrName, oldValue, newValue)\` to get a notification each time the attribute changes. This option is best suited for reactive programming, eg. fetching new data each time the attribute is updated.`);
                }
                console.error(msg.join('\n'));
            }
        });
        propsHash[propName] = 1;
        return propsHash;
    }, create(null));
}

function getPublicMethodsHash(target: Object): HashTable<number> {
    const publicMethods = target.publicMethods;
    if (!publicMethods || !publicMethods.length) {
        return EmptyObject;
    }
    return publicMethods.reduce((methodsHash: HashTable<number>, methodName: string): HashTable => {
        methodsHash[methodName] = 1;
        assert.block(function devModeCheck() {
            assert.isTrue(typeof target.prototype[methodName] === 'function', `Component "${target.name}" should have a method \`${methodName}\` instead of ${target.prototype[methodName]}.`);
            freeze(target.prototype[methodName]);
        });
        return methodsHash;
    }, create(null));
}

function getObservedAttributesHash(target: Object): HashTable<number> {
    // To match WC semantics, only if you have the callback in the prototype, you
    if (!target.prototype.attributeChangedCallback || !target.observedAttributes || !target.observedAttributes.length) {
        return EmptyObject;
    }
    return target.observedAttributes.reduce((observedAttributes: HashTable<number>, attrName: string): HashTable => {
        observedAttributes[attrName] = 1;
        return observedAttributes;
    }, create(null));
}

export function getComponentDef(Ctor: Class<Component>): ComponentDef {
    let def = CtorToDefMap.get(Ctor);
    if (def) {
        return def;
    }
    def = createComponentDef(Ctor);
    CtorToDefMap.set(Ctor, def);
    return def;
}
