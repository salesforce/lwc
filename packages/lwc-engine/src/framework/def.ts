/**
 * This module is responsible for producing the ComponentDef object that is always
 * accessible via `vm.def`. This is lazily created during the creation of the first
 * instance of a component class, and shared across all instances.
 *
 * This structure can be used to synthetically create proxies, and understand the
 * shape of a component. It is also used internally to apply extra optimizations.
 */

import assert from "../shared/assert";
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
    defineProperties,
    seal,
    forEach,
    getPropertyDescriptor,
    StringIndexOf,
} from "../shared/language";
import {
    getGlobalHTMLPropertiesInfo,
    getAttrNameFromPropName,
    ElementAOMPropertyNames,
    defaultDefHTMLPropertyNames,
} from "./attributes";
import decorate, { DecoratorMap } from "./decorators/decorate";
import wireDecorator from "./decorators/wire";
import trackDecorator from "./decorators/track";
import apiDecorator from "./decorators/api";
import { LightningElement as BaseElement, createBaseElementStandardPropertyDescriptors } from "./html-element";
import {
    EmptyObject,
    PatchedFlag,
    resolveCircularModuleDependency,
    isCircularModuleDependency
} from "./utils";
import { getCustomElementVM } from "./vm";
import { BaseCustomElementProto } from "./dom-api";

interface PropDef {
    config: number;
    type: string; // TODO: make this an enum
    attr: string;
}
interface WireDef {
    method?: number;
    [key: string]: any;
}
export interface PropsDef {
    [key: string]: PropDef;
}
interface TrackDef {
    [key: string]: 1;
}
type PublicMethod = (...args: any[]) => any;
interface MethodDef {
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
    elmProto: object;
    connectedCallback?: () => void;
    disconnectedCallback?: () => void;
    renderedCallback?: () => void;
    render?: () => Template;
    errorCallback?: ErrorCallback;
}
import {
    ComponentConstructor, ErrorCallback, ComponentInterface
 } from './component';
import { Template } from "./template";
import { patchLightningElementPrototypeWithRestrictions } from "./restrictions";

const CtorToDefMap: WeakMap<any, ComponentDef> = new WeakMap();

function getCtorProto(Ctor: any): any {
    const proto = getPrototypeOf(Ctor);
    return isCircularModuleDependency(proto) ? resolveCircularModuleDependency(proto) : proto;
}

// According to the WC spec (https://dom.spec.whatwg.org/#dom-element-attachshadow), certain elements
// are not allowed to attached a shadow dom, and therefore, we need to prevent setting forceTagName to
// those, otherwise we will not be able to use shadowDOM when forceTagName is specified in the future.
function assertValidForceTagName(Ctor: ComponentConstructor) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const { forceTagName } = Ctor;
    if (isUndefined(forceTagName)) {
        return;
    }
    const invalidTags = [
        "article", "aside", "blockquote", "body", "div", "footer", "h1", "h2", "h3", "h4",
        "h5", "h6", "header", "main", "nav", "p", "section", "span"];
    if (ArrayIndexOf.call(invalidTags, forceTagName) !== -1) {
        throw new RangeError(`Invalid static forceTagName property set to "${forceTagName}" in component ${Ctor}. None of the following tag names can be used: ${invalidTags.join(", ")}.`);
    }
    if (StringIndexOf.call(forceTagName, '-') !== -1) {
        throw new RangeError(`Invalid static forceTagName property set to "${forceTagName}" in component ${Ctor}. It cannot have a dash (-) on it because that is reserved for existing custom elements.`);
    }
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
    if (globalInitialization) {
        // Note: this routine is just to solve the circular dependencies mess introduced by rollup.
        globalInitialization();
    }
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isElementComponent(Ctor), `${Ctor} is not a valid component, or does not extends Element from "engine". You probably forgot to add the extend clause on the class declaration.`);

        // local to dev block
        const ctorName = Ctor.name;
        assert.isTrue(ctorName && isString(ctorName), `${toString(Ctor)} should have a "name" property with string value, but found ${ctorName}.`);
        assert.isTrue(Ctor.constructor, `Missing ${ctorName}.constructor, ${ctorName} should have a "constructor" property.`);

        assertValidForceTagName(Ctor);
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
    let superElmProto = globalElmProto;
    let superElmDescriptors = globalElmDescriptors;
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
        superElmProto = superDef.elmProto;
        superElmDescriptors = superDef.descriptors;
    }

    const localKeyDescriptors = createCustomElementDescriptorMap(props, methods);
    const elmProto = create(superElmProto, localKeyDescriptors);
    const descriptors = assign(create(null), superElmDescriptors, localKeyDescriptors);
    props = assign(create(null), HTML_PROPS, props);

    const def: ComponentDef = {
        name,
        wire,
        track,
        props,
        methods,
        descriptors,
        elmProto,
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

// across components, the public props are almost much the same, we just cache
// the getter and setter for perf reasons considering that most of them are standard
// global properties, but they need to be monkey patch so we can delegate their
// behavior to the corresponding instance.
const cachedGetterByKey: Record<string, (this: HTMLElement) => any> = create(null);
const cachedSetterByKey: Record<string, (this: HTMLElement, newValue: any) => any> = create(null);

function createGetter(key: string) {
    let fn = cachedGetterByKey[key];
    if (isUndefined(fn)) {
        fn = cachedGetterByKey[key] = function(this: HTMLElement): any {
            const vm = getCustomElementVM(this);
            const { getHook } = vm;
            return getHook(vm.component as ComponentInterface, key);
        };
    }
    return fn;
}

function createSetter(key: string) {
    let fn = cachedSetterByKey[key];
    if (isUndefined(fn)) {
        fn = cachedSetterByKey[key] = function(this: HTMLElement, newValue: any): any {
            const vm = getCustomElementVM(this);
            const { setHook } = vm;
            setHook(vm.component as ComponentInterface, key, newValue);
        };
    }
    return fn;
}

function createMethodCaller(method: PublicMethod): PublicMethod {
    return function(this: HTMLElement): any {
        const vm = getCustomElementVM(this);
        const { callHook } = vm;
        return callHook(vm.component as ComponentInterface, method, ArraySlice.call(arguments));
    };
}

function createCustomElementDescriptorMap(publicProps: PropsDef, publicMethodsConfig: MethodDef): PropertyDescriptorMap {
    const descriptors: PropertyDescriptorMap = create(null);
    // expose getters and setters for each public props on the Element
    for (const key in publicProps) {
        descriptors[key] = {
            get: createGetter(key),
            set: createSetter(key),
            enumerable: true,
            configurable: true,
        };
    }
    // expose public methods as props on the Element
    for (const key in publicMethodsConfig) {
        descriptors[key] = {
            value: createMethodCaller(publicMethodsConfig[key]),
            writable: true,
            configurable: true,
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

// Initialization Routines
import "../polyfills/proxy-concat/main";
import "../polyfills/event-composed/main";
import "../polyfills/focus-event-composed/main";
import "../polyfills/aria-properties/main";

const HTML_PROPS: PropsDef = create(null);
const GLOBAL_PROPS_DESCRIPTORS: PropertyDescriptorMap = create(null);
const globalElmProto: object = create(BaseCustomElementProto);
const globalElmDescriptors: PropertyDescriptorMap = create(null, {
    // this symbol is used as a flag for html-element.ts to determine if
    // the element needs some patches of the proto chain of not. Which
    // helps for the cases when a Web Component is created via the global
    // registry.
    [PatchedFlag]: {}
});

let globalInitialization: any = () => {
    // Note: this routine is just to solve the circular dependencies mess introduced by rollup.
    forEach.call(ElementAOMPropertyNames, (propName: string) => {
        // Note: intentionally using our in-house getPropertyDescriptor instead of getOwnPropertyDescriptor here because
        // in IE11, some properties are on Element.prototype instead of HTMLElement, just to be sure.
        const descriptor = getPropertyDescriptor(HTMLElement.prototype, propName);
        if (!isUndefined(descriptor)) {
            const attrName = getAttrNameFromPropName(propName);
            HTML_PROPS[propName] = {
                config: 3,
                type: 'any',
                attr: attrName,
            };
            const globalElmDescriptor = globalElmDescriptors[propName] = {
                get: createGetter(propName),
                set: createSetter(propName),
                enumerable: true,
                configurable: true,
            };
            defineProperty(globalElmProto, propName, globalElmDescriptor);
            GLOBAL_PROPS_DESCRIPTORS[propName] = descriptor;
        }
    });
    forEach.call(defaultDefHTMLPropertyNames, (propName) => {
        // Note: intentionally using our in-house getPropertyDescriptor instead of getOwnPropertyDescriptor here because
        // in IE11, id property is on Element.prototype instead of HTMLElement, and we suspect that more will fall into
        // this category, so, better to be sure.
        const descriptor = getPropertyDescriptor(HTMLElement.prototype, propName);
        if (!isUndefined(descriptor)) {
            const attrName = getAttrNameFromPropName(propName);
            HTML_PROPS[propName] = {
                config: 3,
                type: 'any',
                attr: attrName,
            };
            const globalElmDescriptor = globalElmDescriptors[propName] = {
                get: createGetter(propName),
                set: createSetter(propName),
                enumerable: true,
                configurable: true,
            };
            defineProperty(globalElmProto, propName, globalElmDescriptor);
            GLOBAL_PROPS_DESCRIPTORS[propName] = descriptor;
        }
    });
    defineProperties(BaseElement.prototype, createBaseElementStandardPropertyDescriptors(GLOBAL_PROPS_DESCRIPTORS));

    if (process.env.NODE_ENV !== 'production') {
        patchLightningElementPrototypeWithRestrictions(BaseElement.prototype);
    }

    freeze(BaseElement);
    seal(BaseElement.prototype);
    globalInitialization = void(0);
};
