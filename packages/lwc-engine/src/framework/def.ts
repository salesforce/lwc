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
    ArraySlice,
    isNull,
    ArrayReduce,
    hasOwnProperty,
} from "./language";
import {
    GlobalAOMProperties,
    getGlobalHTMLPropertiesInfo,
    defaultDefHTMLPropertyNames,
    attemptAriaAttributeFallback,
} from "./dom/attributes";
import {
    getAttribute,
    setAttribute,
    setAttributeNS,
    removeAttribute,
    removeAttributeNS,
} from "./dom/element";
import decorate, { DecoratorMap } from "./decorators/decorate";
import wireDecorator from "./decorators/wire";
import trackDecorator from "./decorators/track";
import apiDecorator from "./decorators/api";
import { Element as BaseElement } from "./html-element";
import { EmptyObject, getPropNameFromAttrName, assertValidForceTagName, ViewModelReflection, getAttrNameFromPropName } from "./utils";
import { OwnerKey, VM, VMElement, getCustomElementVM } from "./vm";

declare interface HashTable<T> {
    [key: string]: T;
}
export interface PropDef {
    config: number;
    type: string; // TODO: make this an enum
    attr: string;
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
export type PublicMethod = (...args: any[]) => any;
export interface MethodDef {
    [key: string]: PublicMethod;
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
    descriptors: PropertyDescriptorMap;
    connectedCallback?: () => void;
    disconnectedCallback?: () => void;
    renderedCallback?: () => void;
    render?: () => Template;
    errorCallback?: ErrorCallback;
}
import {
    ComponentConstructor, ErrorCallback, Component
 } from './component';
import { Template } from "./template";

const CtorToDefMap: WeakMap<any, ComponentDef> = new WeakMap();

function propertiesReducer(seed: PropsDef, propName: string): PropsDef {
    seed[propName] = {
        config: 3,
        type: 'any',
        attr: getAttrNameFromPropName(propName),
    };
    return seed;
}

const reducedDefaultHTMLPropertyNames: PropsDef = ArrayReduce.call(defaultDefHTMLPropertyNames, propertiesReducer, create(null));
const HTML_PROPS: PropsDef = ArrayReduce.call(getOwnPropertyNames(GlobalAOMProperties), propertiesReducer, reducedDefaultHTMLPropertyNames);

function getCtorProto(Ctor: any): any {
    let proto = getPrototypeOf(Ctor);
    // The compiler produce AMD modules that do not support circular dependencies
    // We need to create an indirection to circumvent those cases.
    // We could potentially move this check to the definition
    if (hasOwnProperty.call(proto, '__circular__')) {
        proto = proto();
    }
    return proto;
}

function isElementComponent(Ctor: any, protoSet?: any[]): boolean {
    protoSet = protoSet || [];
    if (!Ctor || ArrayIndexOf.call(protoSet, Ctor) >= 0) {
        return false; // null, undefined, or circular prototype definition
    }
    const proto = getCtorProto(Ctor);
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
    let wire = getWireHash(Ctor);
    const track = getTrackHash(Ctor);

    const proto = Ctor.prototype;
    const decoratorMap: DecoratorMap = create(null);

    // TODO: eventually, the compiler should do this work
    {
        for (const propName in props) {
            decoratorMap[propName] = apiDecorator;
        }
        if (wire) {
            for (const propName in wire) {
                const wireDef: WireDef = wire[propName];
                if (wireDef.method) {
                    // for decorated methods we need to do nothing
                    continue;
                }
                decoratorMap[propName] = wireDecorator(wireDef.adapter, wireDef.params);
            }
        }
        if (track) {
            for (const propName in track) {
                decoratorMap[propName] = trackDecorator;
            }
        }
        decorate(Ctor, decoratorMap);
    }

    let {
        connectedCallback,
        disconnectedCallback,
        renderedCallback,
        errorCallback,
        render,
    } = proto;
    const superProto = getCtorProto(Ctor);
    const superDef: ComponentDef | null = superProto !== BaseElement ? getComponentDef(superProto) : null;
    if (!isNull(superDef)) {
        props = assign(create(null), superDef.props, props);
        methods = assign(create(null), superDef.methods, methods);
        wire = (superDef.wire || wire) ? assign(create(null), superDef.wire, wire) : undefined;
        connectedCallback = connectedCallback || superDef.connectedCallback;
        disconnectedCallback = disconnectedCallback || superDef.disconnectedCallback;
        renderedCallback = renderedCallback || superDef.renderedCallback;
        errorCallback  = errorCallback || superDef.errorCallback;
        render = render || superDef.render;
    }

    props = assign(create(null), HTML_PROPS, props);
    const descriptors = createCustomElementDescriptorMap(props, methods);

    const def: ComponentDef = {
        name,
        wire,
        track,
        props,
        methods,
        descriptors,
        connectedCallback,
        disconnectedCallback,
        renderedCallback,
        errorCallback,
        render,
    };

    if (process.env.NODE_ENV !== 'production') {
        freeze(Ctor.prototype);
        freeze(wire);
        freeze(props);
        freeze(methods);
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
        const vm = getCustomElementVM(this);
        const { getHook } = vm;
        return getHook(vm.component as Component, key);
    };
}

function createSetter(key: string) {
    return function(this: VMElement, newValue: any): any {
        const vm = getCustomElementVM(this);
        const { setHook } = vm;
        setHook(vm.component as Component, key, newValue);
    };
}

function createMethodCaller(method: PublicMethod): PublicMethod {
    return function(this: VMElement): any {
        const vm = getCustomElementVM(this);
        const { callHook } = vm;
        return callHook(vm.component as Component, method, ArraySlice.call(arguments));
    };
}

function getAttributePatched(this: VMElement, attrName: string): string | null {
    if (process.env.NODE_ENV !== 'production') {
        const vm = getCustomElementVM(this);
        assertPublicAttributeCollision(vm, attrName);
    }

    return getAttribute.apply(this, ArraySlice.call(arguments));
}

function setAttributePatched(this: VMElement, attrName: string, newValue: any) {
    const vm = getCustomElementVM(this);
    // marking the set is needed for the AOM polyfill
    vm.hostAttrs[attrName] = 1; // marking the set is needed for the AOM polyfill
    if (process.env.NODE_ENV !== 'production') {
        assertTemplateMutationViolation(vm, attrName);
        assertPublicAttributeCollision(vm, attrName);
    }
    setAttribute.apply(this, ArraySlice.call(arguments));
}

function setAttributeNSPatched(this: VMElement, attrNameSpace: string, attrName: string, newValue: any) {
    const vm = getCustomElementVM(this);

    if (process.env.NODE_ENV !== 'production') {
        assertTemplateMutationViolation(vm, attrName);
        assertPublicAttributeCollision(vm, attrName);
    }
    setAttributeNS.apply(this, ArraySlice.call(arguments));
}

function removeAttributePatched(this: VMElement, attrName: string) {
    const vm = getCustomElementVM(this);
    // marking the set is needed for the AOM polyfill
    if (process.env.NODE_ENV !== 'production') {
        assertTemplateMutationViolation(vm, attrName);
        assertPublicAttributeCollision(vm, attrName);
    }
    removeAttribute.apply(this, ArraySlice.call(arguments));
    attemptAriaAttributeFallback(vm, attrName);
}

function removeAttributeNSPatched(this: VMElement, attrNameSpace: string, attrName: string) {
    const vm = getCustomElementVM(this);

    if (process.env.NODE_ENV !== 'production') {
        assertTemplateMutationViolation(vm, attrName);
        assertPublicAttributeCollision(vm, attrName);
    }
    removeAttributeNS.apply(this, ArraySlice.call(arguments));
}

function assertPublicAttributeCollision(vm: VM, attrName: string) {
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

function createCustomElementDescriptorMap(publicProps: PropsDef, publicMethodsConfig: MethodDef): PropertyDescriptorMap {
    // replacing mutators and accessors on the element itself to catch any mutation
    const descriptors: PropertyDescriptorMap = {
        getAttribute: {
            value: getAttributePatched,
        },
        setAttribute: {
            value: setAttributePatched,
        },
        setAttributeNS: {
            value: setAttributeNSPatched,
        },
        removeAttribute: {
            value: removeAttributePatched,
        },
        removeAttributeNS: {
            value: removeAttributeNSPatched,
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
            value: createMethodCaller(publicMethodsConfig[key]),
        };
    }
    return descriptors;
}

function getTrackHash(target: ComponentConstructor): TrackDef {
    const track = target.track;
    if (!getOwnPropertyDescriptor(target, 'track') || !track || !getOwnPropertyNames(track).length) {
        return EmptyObject;
    }

    // TODO: check that anything in `track` is correctly defined in the prototype
    return assign(create(null), track);
}

function getWireHash(target: ComponentConstructor): WireHash | undefined {
    const wire = target.wire;
    if (!getOwnPropertyDescriptor(target, 'wire') || !wire || !getOwnPropertyNames(wire).length) {
        return;
    }

    // TODO: check that anything in `wire` is correctly defined in the prototype
    return assign(create(null), wire);
}

function getPublicPropertiesHash(target: ComponentConstructor): PropsDef {
    const props = target.publicProps;
    if (!getOwnPropertyDescriptor(target, 'publicProps') || !props || !getOwnPropertyNames(props).length) {
        return EmptyObject;
    }
    return getOwnPropertyNames(props).reduce((propsHash: PropsDef, propName: string): PropsDef => {
        const attrName = getAttrNameFromPropName(propName);
        if (process.env.NODE_ENV !== 'production') {
            const globalHTMLProperty = getGlobalHTMLPropertiesInfo()[propName];
            if (globalHTMLProperty && globalHTMLProperty.attribute && globalHTMLProperty.reflective === false) {
                const { error, attribute, experimental } = globalHTMLProperty;
                const msg: string[] = [];
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

        propsHash[propName] = assign({
            config: 0,
            type: 'any',
            attr: attrName,
        }, props[propName]);
        return propsHash;
    }, create(null));
}

function getPublicMethodsHash(target: ComponentConstructor): MethodDef {
    const publicMethods = target.publicMethods;
    if (!getOwnPropertyDescriptor(target, 'publicMethods') || !publicMethods || !publicMethods.length) {
        return EmptyObject;
    }
    return publicMethods.reduce((methodsHash: MethodDef, methodName: string): MethodDef => {
        if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(isFunction(target.prototype[methodName]), `Component "${target.name}" should have a method \`${methodName}\` instead of ${target.prototype[methodName]}.`);
        }
        methodsHash[methodName] = target.prototype[methodName];
        return methodsHash;
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
