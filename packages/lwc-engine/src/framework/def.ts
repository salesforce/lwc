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
    isObject,
    isUndefined,
    ArraySlice,
    isNull,
} from "./language";
import { GlobalHTMLProperties } from "./dom";
import { createWiredPropertyDescriptor } from "./decorators/wire";
import { createTrackedPropertyDescriptor } from "./decorators/track";
import { createPublicPropertyDescriptor, createPublicAccessorDescriptor } from "./decorators/api";
import { Element as BaseElement, getCustomElementVM } from "./html-element";
import { EmptyObject, getPropNameFromAttrName, assertValidForceTagName } from "./utils";
import { invokeComponentAttributeChangedCallback } from "./invoker";
import { OwnerKey, VM, VMElement } from "./vm";

declare interface HashTable<T> {
    [key: string]: T;
}
export interface PropDef {
    config: number;
    type: string; // TODO: make this an enum
}
export interface WireDef {
    method?: number;
    [key: string]: any;
}
export interface PropsDef {
    [key: string]: PropDef;
}
export interface TrackDef {
    [key: string]: 1;
}
export interface MethodDef {
    [key: string]: 1;
}
export interface ObservedAttrsDef {
    [key: string]: 1;
}
export interface WireHash {
    [key: string]: WireDef;
}
export interface ComponentDef {
    name: string;
    wire: WireHash | undefined;
    track: TrackDef;
    props: PropsDef;
    methods: MethodDef;
    observedAttrs: ObservedAttrsDef;
    descriptors: PropertyDescriptorMap;
    connectedCallback?: () => void;
    disconnectedCallback?: () => void;
    renderedCallback?: () => void;
    errorCallback?: ErrorCallback;
    attributeChangedCallback?: AttributeChangedCallback;
}
import {
    ComponentConstructor, getCustomElementComponent, ErrorCallback, AttributeChangedCallback
 } from './component';

export const ViewModelReflection = Symbol();

let observableHTMLAttrs: ObservedAttrsDef;

if (process.env.NODE_ENV !== 'production') {
    observableHTMLAttrs = getOwnPropertyNames(GlobalHTMLProperties).reduce((acc, key) => {
        const globalProperty = GlobalHTMLProperties[key];
        if (globalProperty && globalProperty.attribute) {
            acc[globalProperty.attribute] = 1;
        }
        return acc;
    }, create(null));
}

const CtorToDefMap: WeakMap<any, ComponentDef> = new WeakMap();

const COMPUTED_GETTER_MASK = 1;
const COMPUTED_SETTER_MASK = 2;

function isElementComponent(Ctor: any, protoSet?: any[]): boolean {
    protoSet = protoSet || [];
    if (!Ctor || ArrayIndexOf.call(protoSet, Ctor) >= 0) {
        return false; // null, undefined, or circular prototype definition
    }
    const proto = getPrototypeOf(Ctor);
    if (proto === BaseElement) {
        return true;
    }
    getComponentDef(proto); // ensuring that the prototype chain is already expanded
    ArrayPush.call(protoSet, Ctor);
    return isElementComponent(proto, protoSet);
}

function createComponentDef(Ctor: ComponentConstructor): ComponentDef {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isElementComponent(Ctor), `${Ctor} is not a valid component, or does not extends Element from "engine". You probably forgot to add the extend clause on the class declaration.`);
        // local to dev block
        const ctorName = Ctor.name;
        assert.isTrue(ctorName && isString(ctorName), `${toString(Ctor)} should have a "name" property with string value, but found ${ctorName}.`);
        assert.isTrue(Ctor.constructor, `Missing ${ctorName}.constructor, ${ctorName} should have a "constructor" property.`);
    }

    const name: string = Ctor.name;
    let props = getPublicPropertiesHash(Ctor);
    let methods = getPublicMethodsHash(Ctor);
    const observedAttrs = getObservedAttributesHash(Ctor);
    let wire = getWireHash(Ctor);
    const track = getTrackHash(Ctor);

    const proto = Ctor.prototype;
    for (const propName in props) {
        const propDef = props[propName];
        // initializing getters and setters for each public prop on the target prototype
        const descriptor = getOwnPropertyDescriptor(proto, propName);
        const { config } = propDef;
        if (COMPUTED_SETTER_MASK & config || COMPUTED_GETTER_MASK & config) {
            if (process.env.NODE_ENV !== 'production') {
                assert.invariant(!descriptor || (isFunction(descriptor.get) || isFunction(descriptor.set)), `Invalid ${name}.prototype.${propName} definition, it cannot be a prototype definition if it is a public property. Instead use the constructor to define it.`);
                const mustHaveGetter = COMPUTED_GETTER_MASK & config;
                const mustHaveSetter = COMPUTED_SETTER_MASK & config;
                if (mustHaveGetter) {
                    assert.isTrue(isObject(descriptor) && isFunction(descriptor.get), `Missing getter for property ${propName} decorated with @api in ${name}`);
                }
                if (mustHaveSetter) {
                    assert.isTrue(isObject(descriptor) && isFunction(descriptor.set), `Missing setter for property ${propName} decorated with @api in ${name}`);
                    assert.isTrue(mustHaveGetter, `Missing getter for property ${propName} decorated with @api in ${name}. You cannot have a setter without the corresponding getter.`);
                }
            }
            createPublicAccessorDescriptor(proto, propName, descriptor);
        } else {
            createPublicPropertyDescriptor(proto, propName, descriptor);
        }
    }
    if (wire) {
        for (const propName in wire) {
            if (wire[propName].method) {
                // for decorated methods we need to do nothing
                continue;
            }
            const descriptor = getOwnPropertyDescriptor(proto, propName);
            // TODO: maybe these conditions should be always applied.
            if (process.env.NODE_ENV !== 'production') {
                const { get, set, configurable, writable } = descriptor || EmptyObject;
                assert.isTrue(!get && !set, `Compiler Error: A decorator can only be applied to a public field.`);
                assert.isTrue(configurable !== false, `Compiler Error: A decorator can only be applied to a configurable property.`);
                assert.isTrue(writable !== false, `Compiler Error: A decorator can only be applied to a writable property.`);
            }
            // initializing getters and setters for each public prop on the target prototype
            createWiredPropertyDescriptor(proto, propName, descriptor);
        }
    }
    if (track) {
        for (const propName in track) {
            const descriptor = getOwnPropertyDescriptor(proto, propName);
            // TODO: maybe these conditions should be always applied.
            if (process.env.NODE_ENV !== 'production') {
                const { get, set, configurable, writable } = descriptor || EmptyObject;
                assert.isTrue(!get && !set, `Compiler Error: A decorator can only be applied to a public field.`);
                assert.isTrue(configurable !== false, `Compiler Error: A decorator can only be applied to a configurable property.`);
                assert.isTrue(writable !== false, `Compiler Error: A decorator can only be applied to a writable property.`);
            }
            // initializing getters and setters for each public prop on the target prototype
            createTrackedPropertyDescriptor(proto, propName, descriptor);
        }
    }

    let {
        connectedCallback,
        disconnectedCallback,
        renderedCallback,
        errorCallback,
        attributeChangedCallback,
    } = proto;
    const superProto = getPrototypeOf(Ctor);
    const superDef: ComponentDef | null = superProto !== BaseElement ? getComponentDef(superProto) : null;
    if (!isNull(superDef)) {
        props = assign(create(null), superDef.props, props);
        methods = assign(create(null), superDef.methods, methods);
        wire = (superDef.wire || wire) ? assign(create(null), superDef.wire, wire) : undefined;
        connectedCallback = connectedCallback || superDef.connectedCallback;
        disconnectedCallback = disconnectedCallback || superDef.disconnectedCallback;
        renderedCallback = renderedCallback || superDef.renderedCallback;
        errorCallback  = errorCallback || superDef.errorCallback;
        attributeChangedCallback = attributeChangedCallback || superDef.attributeChangedCallback;
    }

    const descriptors = createDescriptorMap(props, methods);

    const def: ComponentDef = {
        name,
        wire,
        track,
        props,
        methods,
        observedAttrs,
        descriptors,
        connectedCallback,
        disconnectedCallback,
        renderedCallback,
        errorCallback,
        attributeChangedCallback,
    };

    if (process.env.NODE_ENV !== 'production') {
        freeze(Ctor.prototype);
        freeze(wire);
        freeze(props);
        freeze(methods);
        freeze(observedAttrs);
        for (const key in def) {
            defineProperty(def, key, {
                configurable: false,
                writable: false,
            });
        }
    }
    return def;
}

function createGetter(key: string) {
    return function(this: VMElement): any {
        return getCustomElementComponent(this)[key];
    };
}

function createSetter(key: string) {
    return function(this: VMElement, newValue: any): any {
        getCustomElementComponent(this)[key] = newValue;
    };
}

function createMethodCaller(key: string) {
    return function(this: VMElement): any {
        const component = getCustomElementComponent(this);
        return component[key].apply(component, ArraySlice.call(arguments));
    };
}

const {
    getAttribute,
    getAttributeNS,
    setAttribute,
    setAttributeNS,
    removeAttribute,
    removeAttributeNS
} = Element.prototype;

function getAttributePatched(this: VMElement, attrName: string): string | null {
    if (process.env.NODE_ENV !== 'production') {
        const vm = getCustomElementVM(this);
        assertPublicAttributeColission(vm, attrName);
    }

    return getAttribute.apply(this, ArraySlice.call(arguments));
}

function setAttributePatched(this: VMElement, attrName: string, newValue: any) {
    const vm = getCustomElementVM(this);

    if (process.env.NODE_ENV !== 'production') {
        assertTemplateMutationViolation(vm, attrName);
        assertPublicAttributeColission(vm, attrName);
    }
    const isObserved = isAttrObserved(vm, attrName);
    const oldValue = isObserved ? getAttribute.call(this, attrName) : null;

    setAttribute.apply(this, ArraySlice.call(arguments));

    if (isObserved) {
        newValue = getAttribute.call(this, attrName);
        if (oldValue !== newValue) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
        }
    }
}

function setAttributeNSPatched(this: VMElement, attrNameSpace: string, attrName: string, newValue: any) {
    const vm = getCustomElementVM(this);

    if (process.env.NODE_ENV !== 'production') {
        assertTemplateMutationViolation(vm, attrName);
        assertPublicAttributeColission(vm, attrName);
    }
    const isObserved = isAttrObserved(vm, attrName);
    const oldValue = isObserved ? getAttributeNS.call(this, attrNameSpace, attrName) : null;

    setAttributeNS.apply(this, ArraySlice.call(arguments));

    if (isObserved) {
        newValue = getAttributeNS.call(this, attrNameSpace, attrName);
        if (oldValue !== newValue) {
            invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
        }
    }
}

function removeAttributePatched(this: VMElement, attrName: string) {
    const vm = getCustomElementVM(this);

    if (process.env.NODE_ENV !== 'production') {
        assertTemplateMutationViolation(vm, attrName);
        assertPublicAttributeColission(vm, attrName);
    }
    const isObserved = isAttrObserved(vm, attrName);
    const oldValue = isObserved ? getAttribute.call(this, attrName) : null;

    removeAttribute.apply(this, ArraySlice.call(arguments));

    if (isObserved && oldValue !== null) {
        invokeComponentAttributeChangedCallback(vm, attrName, oldValue, null);
    }
}

function removeAttributeNSPatched(this: VMElement, attrNameSpace: string, attrName: string) {
    const vm = getCustomElementVM(this);

    if (process.env.NODE_ENV !== 'production') {
        assertTemplateMutationViolation(vm, attrName);
        assertPublicAttributeColission(vm, attrName);
    }
    const isObserved = isAttrObserved(vm, attrName);
    const oldValue = isObserved ? getAttributeNS.call(this, attrNameSpace, attrName) : null;

    removeAttributeNS.apply(this, ArraySlice.call(arguments));

    if (isObserved && oldValue !== null) {
        invokeComponentAttributeChangedCallback(vm, attrName, oldValue, null);
    }
}

function assertPublicAttributeColission(vm: VM, attrName: string) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const propName = isString(attrName) ? getPropNameFromAttrName(attrName.toLocaleLowerCase()) : null;
    const { def: { props: propsConfig } } = vm;

    if (propsConfig && propName && propsConfig[propName]) {
        assert.logError(`Invalid attribute "${attrName.toLocaleLowerCase()}" for ${vm}. Instead access the public property with \`element.${propName};\`.`);
    }
}

function assertTemplateMutationViolation(vm: VM, attrName: string) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const { elm } = vm;
    if (!isAttributeChangeControlled(attrName) && !isUndefined(elm[OwnerKey])) {
        assert.logError(`Invalid operation on Element ${vm}. Elements created via a template should not be mutated using DOM APIs. Instead of attempting to update this element directly to change the value of attribute "${attrName}", you can update the state of the component, and let the engine to rehydrate the element accordingly.`);
    }
    // attribute change control must be released every time its value is checked
    resetAttributeChangeControl();
}

function isAttrObserved(vm: VM, attrName: string): boolean {
    return attrName in vm.def.observedAttrs;
}

let controlledAttributeChange: boolean = false;
let controlledAttributeName: string | void;

function isAttributeChangeControlled(attrName: string): boolean {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    return controlledAttributeChange && attrName === controlledAttributeName;
}

function resetAttributeChangeControl() {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    controlledAttributeChange = false;
    controlledAttributeName = undefined;
}

export function prepareForAttributeMutationFromTemplate(elm: Element, key: string) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    if (elm[ViewModelReflection]) {
        // TODO: we should guarantee that the methods of the element are all patched
        controlledAttributeChange = true;
        controlledAttributeName = key;
    }
}

function createDescriptorMap(publicProps: PropsDef, publicMethodsConfig: MethodDef): PropertyDescriptorMap {
    // replacing mutators and accessors on the element itself to catch any mutation
    const descriptors: PropertyDescriptorMap = {
        getAttribute: {
            value: getAttributePatched,
            configurable: true, // TODO: issue #653: Remove configurable once locker-membrane is introduced
        },
        setAttribute: {
            value: setAttributePatched,
            configurable: true, // TODO: issue #653: Remove configurable once locker-membrane is introduced
        },
        setAttributeNS: {
            value: setAttributeNSPatched,
            configurable: true, // TODO: issue #653: Remove configurable once locker-membrane is introduced
        },
        removeAttribute: {
            value: removeAttributePatched,
            configurable: true, // TODO: issue #653: Remove configurable once locker-membrane is introduced
        },
        removeAttributeNS: {
            value: removeAttributeNSPatched,
            configurable: true, // TODO: issue #653: Remove configurable once locker-membrane is introduced
        },
    };
    // expose getters and setters for each public props on the Element
    for (const key in publicProps) {
        descriptors[key] = {
            get: createGetter(key),
            set: createSetter(key),
        };
    }
    // expose public methods as props on the Element
    for (const key in publicMethodsConfig) {
        descriptors[key] = {
            value: createMethodCaller(key),
            configurable: true, // TODO: issue #653: Remove configurable once locker-membrane is introduced
        };
    }
    return descriptors;
}

function getTrackHash(target: ComponentConstructor): TrackDef {
    const track = target.track;
    if (!track || !getOwnPropertyNames(track).length) {
        return EmptyObject;
    }

    // TODO: check that anything in `track` is correctly defined in the prototype
    return assign(create(null), track);
}

function getWireHash(target: ComponentConstructor): WireHash | undefined {
    const wire = target.wire;
    if (!wire || !getOwnPropertyNames(wire).length) {
        return;
    }

    // TODO: check that anything in `wire` is correctly defined in the prototype
    return assign(create(null), wire);
}

function getPublicPropertiesHash(target: ComponentConstructor): PropsDef {
    const props = target.publicProps;
    if (!props || !getOwnPropertyNames(props).length) {
        return EmptyObject;
    }
    return getOwnPropertyNames(props).reduce((propsHash: PropsDef, propName: string): PropsDef => {
        if (process.env.NODE_ENV !== 'production') {
            if (GlobalHTMLProperties[propName] && GlobalHTMLProperties[propName].attribute) {
                const { error, attribute, experimental } = GlobalHTMLProperties[propName];
                const msg = [];
                if (error) {
                    msg.push(error);
                } else if (experimental) {
                    msg.push(`"${propName}" is an experimental property that is not standardized or supported by all browsers. You should not use "${propName}" and attribute "${attribute}" in your component.`);
                } else {
                    msg.push(`"${propName}" is a global HTML property. Instead access it via the reflective attribute "${attribute}" with one of these techniques:`);
                    msg.push(`  * Use \`this.getAttribute("${attribute}")\` to access the attribute value. This option is best suited for accessing the value in a getter during the rendering process.`);
                    msg.push(`  * Declare \`static observedAttributes = ["${attribute}"]\` and use \`attributeChangedCallback(attrName, oldValue, newValue)\` to get a notification each time the attribute changes. This option is best suited for reactive programming, eg. fetching new data each time the attribute is updated.`);
                }
                console.error(msg.join('\n')); // tslint:disable-line
            }
        }

        propsHash[propName] = assign({ config: 0, type: 'any' }, props[propName]);
        return propsHash;
    }, create(null));
}

function getPublicMethodsHash(target: ComponentConstructor): MethodDef {
    const publicMethods = target.publicMethods;
    if (!publicMethods || !publicMethods.length) {
        return EmptyObject;
    }
    return publicMethods.reduce((methodsHash: MethodDef, methodName: string): MethodDef => {
        methodsHash[methodName] = 1;

        if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(isFunction(target.prototype[methodName]), `Component "${target.name}" should have a method \`${methodName}\` instead of ${target.prototype[methodName]}.`);
            freeze(target.prototype[methodName]);
        }

        return methodsHash;
    }, create(null));
}

function getObservedAttributesHash(target: ComponentConstructor): ObservedAttrsDef {
    const observedAttributes = target.observedAttributes;
    if (!observedAttributes || !observedAttributes.length) {
        return EmptyObject;
    }
    return observedAttributes.reduce((reducer: ObservedAttrsDef, attrName: string): ObservedAttrsDef => {
        if (process.env.NODE_ENV !== 'production') {
            const propName = getPropNameFromAttrName(attrName);
            // Check if it is a user defined public property
            if (target.publicProps && target.publicProps[propName]) { // User defined prop
                assert.fail(`Invalid entry "${attrName}" in component ${target.name} observedAttributes. To observe mutations of the public property "${propName}" you can define a public getter and setter decorated with @api in component ${target.name}.`);
            } else if (!observableHTMLAttrs[attrName] && ( GlobalHTMLProperties[propName] && GlobalHTMLProperties[propName].attribute)) {
                // Check for misspellings
                assert.fail(`Invalid entry "${attrName}" in component ${target.name} observedAttributes. "${attrName}" is not a valid global HTML Attribute. Did you mean "${GlobalHTMLProperties[propName].attribute}"? See https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes`);
            } else if (!observableHTMLAttrs[attrName] && (attrName.indexOf('data-') === -1 && attrName.indexOf('aria-') === -1)) {
                // Attribute is not valid observable HTML Attribute
                assert.fail(`Invalid entry "${attrName}" in component ${target.name} observedAttributes. "${attrName}" is not a valid global HTML Attribute. See https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes`);
            }
        }
        reducer[attrName] = 1;
        return reducer;
    }, create(null));
}

export function getComponentDef(Ctor: ComponentConstructor): ComponentDef {
    let def = CtorToDefMap.get(Ctor);
    if (def) {
        return def;
    }
    def = createComponentDef(Ctor);
    CtorToDefMap.set(Ctor, def);
    return def;
}

const TagNameToCtor: HashTable<ComponentConstructor> = create(null);

export function getCtorByTagName(tagName: string): ComponentConstructor | undefined {
    return TagNameToCtor[tagName];
    /////// TODO: what is this?
}

export function registerComponent(tagName: string, Ctor: ComponentConstructor) {
    if (process.env.NODE_ENV !== 'production') {
        assertValidForceTagName(Ctor);
    }
    if (!isUndefined(TagNameToCtor[tagName])) {
        if (TagNameToCtor[tagName] === Ctor) {
            return;
        } else if (process.env.NODE_ENV !== 'production') {
            // TODO: eventually we should throw, this is only needed for the tests today
            assert.logWarning(`Different component class cannot be registered to the same tagName="${tagName}".`);
        }
    }
    TagNameToCtor[tagName] = Ctor;
}
