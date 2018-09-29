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
    isNull,
    setPrototypeOf,
    ArrayReduce,
} from "../shared/language";
import {
    getGlobalHTMLPropertiesInfo,
    getAttrNameFromPropName,
} from "./attributes";
import decorate, { DecoratorMap } from "./decorators/decorate";
import wireDecorator from "./decorators/wire";
import trackDecorator from "./decorators/track";
import apiDecorator from "./decorators/api";
import {
    EmptyObject,
    resolveCircularModuleDependency,
    isCircularModuleDependency
} from "./utils";

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
    bridge: HTMLElementConstructor;
    connectedCallback?: () => void;
    disconnectedCallback?: () => void;
    renderedCallback?: () => void;
    render?: () => Template;
    errorCallback?: ErrorCallback;
}
import {
    ComponentConstructor, ErrorCallback
 } from './component';
import { Template } from "./template";

const CtorToDefMap: WeakMap<any, ComponentDef> = new WeakMap();

function getCtorProto(Ctor: any): ComponentConstructor {
    let proto: ComponentConstructor | null = getPrototypeOf(Ctor);
    if (isNull(proto)) {
        throw new ReferenceError(`Invalid prototype chain for ${Ctor}, you must extend LightningElement.`);
    }
    // covering the cases where the ref is circular in AMD
    if (isCircularModuleDependency(proto)) {
        const p = resolveCircularModuleDependency(proto);
        if (process.env.NODE_ENV !== 'production') {
            if (isNull(p)) {
                throw new ReferenceError(`Circular module dependency must resolve to a constructor that extends LightningElement.`);
            }
        }
        // escape hatch for Locker and other abstractions to provide their own base class instead
        // of our Base class without having to leak it to user-land. If the circular function returns
        // itself, that's the signal that we have hit the end of the proto chain, which must always
        // be base.
        proto = p === proto ? BaseLightningElement : p;
    }
    return proto as ComponentConstructor;
}

function isComponentConstructor(Ctor: any, protoSet?: any[]): boolean {
    protoSet = protoSet || [];
    if (!Ctor || ArrayIndexOf.call(protoSet, Ctor) >= 0) {
        return false; // null, undefined, or circular prototype definition
    }
    const proto = getCtorProto(Ctor);
    if (proto as any === BaseLightningElement) {
        return true;
    }
    getComponentDef(proto); // ensuring that the prototype chain is already expanded
    ArrayPush.call(protoSet, Ctor);
    return isComponentConstructor(proto, protoSet);
}

function createComponentDef(Ctor: ComponentConstructor): ComponentDef {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isComponentConstructor(Ctor), `${Ctor} is not a valid component, or does not extends LightningElement from "lwc". You probably forgot to add the extend clause on the class declaration.`);

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
    const superDef: ComponentDef | null = superProto as any !== BaseLightningElement ? getComponentDef(superProto) : null;
    const SuperElement = isNull(superDef) ? BaseHTMLElement : superDef.bridge;
    const bridge = HTMLElementBridgeFactory(SuperElement, getOwnPropertyNames(props), getOwnPropertyNames(methods));
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

    const def: ComponentDef = {
        name,
        wire,
        track,
        props,
        methods,
        bridge,
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

export function setElementProto(elm: HTMLElement, def: ComponentDef) {
    setPrototypeOf(elm, def.bridge.prototype);
}

import { HTMLElementOriginalDescriptors } from "./html-properties";
import { BaseLightningElement } from "./base-lightning-element";
import { BaseHTMLElement, HTMLElementBridgeFactory, HTMLElementConstructor } from "./base-html-element";

const HTML_PROPS: PropsDef = ArrayReduce.call(getOwnPropertyNames(HTMLElementOriginalDescriptors), (props: PropsDef, propName: string): PropsDef => {
    const attrName = getAttrNameFromPropName(propName);
    props[propName] = {
        config: 3,
        type: 'any',
        attr: attrName,
    };
    return props;
}, create(null));
