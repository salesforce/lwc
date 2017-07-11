/**
 * This module is responsible for producing the ComponentDef object that is always
 * accessible via `vm.def`. This is lazily created during the creation of the first
 * instance of a component class, and shared across all instances.
 *
 * This structure can be used to synthetically create proxies, and understand the
 * shape of a component. It is also used internally to apply extra optimizations.
 */

import assert from "./assert";
import {
    assign,
    freeze,
    create,
    ArrayIndexOf,
    toString,
    ArrayPush,
    defineProperty,
    getOwnPropertyDescriptor,
    getOwnPropertyNames,
    getPrototypeOf,
    isString,
    isFunction,
    isUndefined,
    isObject,
} from "./language";
import { GlobalHTMLProperties } from "./dom";
import { Element, createPublicPropertyDescriptor, createWiredPropertyDescriptor } from "./html-element";
import { EmptyObject, getAttrNameFromPropName, getPropNameFromAttrName } from "./utils";
/*eslint-disable*/
import {
    ComponentClass
 } from './component';
 /*eslint-enable*/

 let observableHTMLAttrs: HashTable<boolean>;

 assert.block(function devModeCheck () {
    observableHTMLAttrs = getOwnPropertyNames(GlobalHTMLProperties).reduce((acc, key) => {
        const globalProperty = GlobalHTMLProperties[key];
        if (globalProperty && globalProperty.attribute) {
            acc[globalProperty.attribute] = true;
        }
        return acc;
    }, create(null));
 });

const CtorToDefMap: WeakMap<any, ComponentDef> = new WeakMap();

const COMPUTED_GETTER_MASK = 1;
const COMPUTED_SETTER_MASK = 2;

function isElementComponent(Ctor: any, protoSet?: Array<any>): boolean {
    protoSet = protoSet || [];
    if (!Ctor || ArrayIndexOf.call(protoSet, Ctor) >= 0) {
        return false; // null, undefined, or circular prototype definition
    }
    const proto = getPrototypeOf(Ctor);
    if (proto === Element) {
        return true;
    }
    getComponentDef(proto); // ensuring that the prototype chain is already expanded
    ArrayPush.call(protoSet, Ctor);
    return isElementComponent(proto, protoSet);
}

function createComponentDef(Ctor: ComponentClass): ComponentDef {
    assert.isTrue(isElementComponent(Ctor), `${Ctor} is not a valid component, or does not extends Element from "engine". You probably forgot to add the extend clause on the class declaration.`);
    const name: string = Ctor.name;
    assert.isTrue(name && isString(name), `${toString(Ctor)} should have a "name" property with string value, but found ${name}.`);
    assert.isTrue(Ctor.constructor, `Missing ${name}.constructor, ${name} should have a "constructor" property.`);
    let props = getPublicPropertiesHash(Ctor);
    let methods = getPublicMethodsHash(Ctor);
    let observedAttrs = getObservedAttributesHash(Ctor);
    let wire = getWireHash(Ctor);

    const proto = Ctor.prototype;
    for (let propName in props) {
        const propDef = props[propName];
        // initializing getters and setters for each public prop on the target prototype
        const descriptor = getOwnPropertyDescriptor(proto, propName);
        const isComputed = descriptor && (isFunction(descriptor.get) || isFunction(descriptor.set));
        assert.invariant(!descriptor || isComputed, `Invalid ${name}.prototype.${propName} definition, it cannot be a prototype definition if it is a public property. Instead use the constructor to define it.`);
        const { config } = propDef;
        if (COMPUTED_GETTER_MASK & config) {
            assert.isTrue(isObject(descriptor) && isFunction(descriptor.get), `Missing getter for property ${propName} decorated with @api in ${name}`);
            propDef.getter = descriptor.get;
        }
        if (COMPUTED_SETTER_MASK & config) {
            assert.isTrue(isObject(descriptor) && isFunction(descriptor.set), `Missing setter for property ${propName} decorated with @api in ${name}`);
            propDef.setter = descriptor.set;
        }
        defineProperty(proto, propName, createPublicPropertyDescriptor(propName, descriptor));
    }

    if (wire) {
        for (let propName in wire) {
            const descriptor = getOwnPropertyDescriptor(proto, propName);
            // for decorated methods we need to do nothing
            if (isUndefined(wire[propName].method)) {
                // initializing getters and setters for each public prop on the target prototype
                const isComputed = descriptor && (isFunction(descriptor.get) || isFunction(descriptor.set));
                assert.invariant(!descriptor || isComputed, `Invalid ${name}.prototype.${propName} definition, it cannot be a prototype definition if it is a property decorated with the @wire decorator.`);
                defineProperty(proto, propName, createWiredPropertyDescriptor(propName));
            }
        }
    }

    const superProto = getPrototypeOf(Ctor);
    if (superProto !== Element) {
        const superDef = getComponentDef(superProto);
        props = assign(create(null), superDef.props, props);
        methods = assign(create(null), superDef.methods, methods);
        wire = (superDef.wire || wire) ? assign(create(null), superDef.wire, wire) : undefined;
    }

    const def: ComponentDef = {
        name,
        wire,
        props,
        methods,
        observedAttrs,
    };

    assert.block(function devModeCheck() {
        getOwnPropertyNames(observedAttrs).forEach((observedAttributeName) => {
            const camelName = getPropNameFromAttrName(observedAttributeName);
            const propDef = props[camelName];

            if (propDef) { // User defined prop
                if (propDef.setter) { // Ensure user has not defined setter
                    assert.fail(`Invalid entry "${observedAttributeName}" in component ${name} observedAttributes. Use existing "${camelName}" setter to track changes.`);
                } else if (observedAttributeName !== getAttrNameFromPropName(camelName)) { // Ensure observed attribute is kebab case
                    assert.fail(`Invalid entry "${observedAttributeName}" in component ${name} observedAttributes. Did you mean "${getAttrNameFromPropName(camelName)}"?`);
                }
            } else if (!observableHTMLAttrs[camelName]) { // Check if observed attribute is observable HTML Attribute
                if (GlobalHTMLProperties[camelName] && GlobalHTMLProperties[camelName].attribute) { // Check for misspellings
                    assert.fail(`Invalid entry "${observedAttributeName}" in component ${name} observedAttributes. "${observedAttributeName}" is not a valid global HTML Attribute. Did you mean "${GlobalHTMLProperties[camelName].attribute}"? See https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes`);
                } else { // Attribute is not valid observable HTML Attribute
                    assert.fail(`Invalid entry "${observedAttributeName}" in component ${name} observedAttributes. "${observedAttributeName}" is not a valid global HTML Attribute. See https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes`);
                }
            }
        });

        freeze(Ctor.prototype);
        freeze(wire);
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

function getWireHash(target: ComponentClass): HashTable<WireDef> | undefined {
    const wire = target.wire;
    if (!wire || !getOwnPropertyNames(wire).length) {
        return;
    }

    assert.block(function devModeCheck() {
        // TODO: check that anything in `wire` is correctly defined in the prototype
    });
    return assign(create(null), wire);
}

function getPublicPropertiesHash(target: ComponentClass): HashTable<PropDef> {
    const props = target.publicProps;
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

        propsHash[propName] = assign({ config: 0 }, props[propName]);
        return propsHash;
    }, create(null));
}

function getPublicMethodsHash(target: ComponentClass): HashTable<number> {
    const publicMethods = target.publicMethods;
    if (!publicMethods || !publicMethods.length) {
        return EmptyObject;
    }
    return publicMethods.reduce((methodsHash: HashTable<number>, methodName: string): HashTable<number> => {
        methodsHash[methodName] = 1;
        assert.block(function devModeCheck() {
            assert.isTrue(isFunction(target.prototype[methodName]), `Component "${target.name}" should have a method \`${methodName}\` instead of ${target.prototype[methodName]}.`);
            freeze(target.prototype[methodName]);
        });
        return methodsHash;
    }, create(null));
}

function getObservedAttributesHash(target: ComponentClass): HashTable<number> {
    const observedAttributes = target.observedAttributes;
    if (!observedAttributes || !observedAttributes.length) {
        return EmptyObject;
    }
    return observedAttributes.reduce((observedAttributes: HashTable<number>, attrName: string): HashTable<number> => {
        observedAttributes[attrName] = 1;
        return observedAttributes;
    }, create(null));
}

export function getComponentDef(Ctor: ComponentClass): ComponentDef {
    let def = CtorToDefMap.get(Ctor);
    if (def) {
        return def;
    }
    def = createComponentDef(Ctor);
    CtorToDefMap.set(Ctor, def);
    return def;
}
