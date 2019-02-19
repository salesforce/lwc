/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
 * This module is responsible for producing the ComponentDef object that is always
 * accessible via `vm.def`. This is lazily created during the creation of the first
 * instance of a component class, and shared across all instances.
 *
 * This structure can be used to synthetically create proxies, and understand the
 * shape of a component. It is also used internally to apply extra optimizations.
 */

import assert from '../shared/assert';
import {
    assign,
    freeze,
    create,
    ArrayIndexOf,
    ArrayPush,
    getOwnPropertyNames,
    getPrototypeOf,
    isNull,
    setPrototypeOf,
    ArrayReduce,
    isUndefined,
    getOwnPropertyDescriptor,
} from '../shared/language';
import { getInternalField } from '../shared/fields';
import { getAttrNameFromPropName } from './attributes';
import {
    resolveCircularModuleDependency,
    isCircularModuleDependency,
    ViewModelReflection,
    EmptyObject,
} from './utils';
import {
    ComponentConstructor,
    ErrorCallback,
    ComponentMeta,
    getComponentRegisteredMeta,
} from './component';
import { Template } from './template';

export interface ComponentDef extends DecoratorMeta {
    name: string;
    template?: Template;
    ctor: ComponentConstructor;
    bridge: HTMLElementConstructor;
    connectedCallback?: () => void;
    disconnectedCallback?: () => void;
    renderedCallback?: () => void;
    render: () => Template;
    errorCallback?: ErrorCallback;
}

const CtorToDefMap: WeakMap<any, ComponentDef> = new WeakMap();

function getCtorProto(Ctor: any, subclassComponentName: string): ComponentConstructor {
    let proto: ComponentConstructor | null = getPrototypeOf(Ctor);
    if (isNull(proto)) {
        throw new ReferenceError(
            `Invalid prototype chain for ${subclassComponentName}, you must extend LightningElement.`,
        );
    }
    // covering the cases where the ref is circular in AMD
    if (isCircularModuleDependency(proto)) {
        const p = resolveCircularModuleDependency(proto);
        if (process.env.NODE_ENV !== 'production') {
            if (isNull(p)) {
                throw new ReferenceError(
                    `Circular module dependency for ${subclassComponentName}, must resolve to a constructor that extends LightningElement.`,
                );
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

function isElementComponent(Ctor: any, subclassComponentName, protoSet?: any[]): boolean {
    protoSet = protoSet || [];
    if (!Ctor || ArrayIndexOf.call(protoSet, Ctor) >= 0) {
        return false; // null, undefined, or circular prototype definition
    }
    const proto = getCtorProto(Ctor, subclassComponentName);
    if ((proto as any) === BaseLightningElement) {
        return true;
    }
    getComponentDef(proto, subclassComponentName); // ensuring that the prototype chain is already expanded
    ArrayPush.call(protoSet, Ctor);
    return isElementComponent(proto, subclassComponentName, protoSet);
}

function createComponentDef(
    Ctor: ComponentConstructor,
    meta: ComponentMeta,
    subclassComponentName: string,
): ComponentDef {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(
            isElementComponent(Ctor, subclassComponentName),
            `${Ctor} is not a valid component, or does not extends LightningElement from "lwc". You probably forgot to add the extend clause on the class declaration.`,
        );

        // local to dev block
        const ctorName = Ctor.name;
        // Removing the following assert until https://bugs.webkit.org/show_bug.cgi?id=190140 is fixed.
        // assert.isTrue(ctorName && isString(ctorName), `${toString(Ctor)} should have a "name" property with string value, but found ${ctorName}.`);
        assert.isTrue(
            Ctor.constructor,
            `Missing ${ctorName}.constructor, ${ctorName} should have a "constructor" property.`,
        );
    }

    const { name, template } = meta;

    let decoratorsMeta = getDecoratorsRegisteredMeta(Ctor);

    // TODO: eventually, the compiler should do this call directly, but we will also
    // have to fix all our tests, which are using this declaration manually.
    if (isUndefined(decoratorsMeta)) {
        registerDecorators(Ctor, {
            publicMethods: getOwnValue(Ctor, 'publicMethods'),
            publicProps: getOwnValue(Ctor, 'publicProps'),
            track: getOwnValue(Ctor, 'track'),
            wire: getOwnValue(Ctor, 'wire'),
        });
        decoratorsMeta = getDecoratorsRegisteredMeta(Ctor);
    }

    let { props, methods, wire, track } = decoratorsMeta || EmptyObject;
    const proto = Ctor.prototype;

    let {
        connectedCallback,
        disconnectedCallback,
        renderedCallback,
        errorCallback,
        render,
    } = proto;
    const superProto = getCtorProto(Ctor, subclassComponentName);
    const superDef: ComponentDef | null =
        (superProto as any) !== BaseLightningElement
            ? getComponentDef(superProto, subclassComponentName)
            : null;
    const SuperBridge = isNull(superDef) ? BaseBridgeElement : superDef.bridge;
    const bridge = HTMLBridgeElementFactory(
        SuperBridge,
        getOwnPropertyNames(props),
        getOwnPropertyNames(methods),
    );
    if (!isNull(superDef)) {
        props = assign(create(null), superDef.props, props);
        methods = assign(create(null), superDef.methods, methods);
        wire = superDef.wire || wire ? assign(create(null), superDef.wire, wire) : undefined;
        track = assign(create(null), superDef.track, track);
        connectedCallback = connectedCallback || superDef.connectedCallback;
        disconnectedCallback = disconnectedCallback || superDef.disconnectedCallback;
        renderedCallback = renderedCallback || superDef.renderedCallback;
        errorCallback = errorCallback || superDef.errorCallback;
        render = render || superDef.render;
    }
    props = assign(create(null), HTML_PROPS, props);

    const def: ComponentDef = {
        ctor: Ctor,
        name,
        wire,
        track,
        props,
        methods,
        bridge,
        template,
        connectedCallback,
        disconnectedCallback,
        renderedCallback,
        errorCallback,
        render,
    };

    if (process.env.NODE_ENV !== 'production') {
        freeze(Ctor.prototype);
    }
    return def;
}

export function isComponentConstructor(Ctor: any): boolean {
    return isElementComponent(Ctor, Ctor.name);
}

function getOwnValue(o: any, key: string): any | undefined {
    const d = getOwnPropertyDescriptor(o, key);
    return d && d.value;
}

export function getComponentDef(
    Ctor: ComponentConstructor,
    subclassComponentName?: string,
): ComponentDef {
    let def = CtorToDefMap.get(Ctor);
    if (def) {
        return def;
    }
    let meta = getComponentRegisteredMeta(Ctor);
    if (isUndefined(meta)) {
        // TODO: remove this workaround:
        // this is temporary until
        // all tests are updated to call registerComponent:
        meta = {
            template: undefined,
            name: Ctor.name,
        };
    }
    def = createComponentDef(Ctor, meta, subclassComponentName || Ctor.name);
    CtorToDefMap.set(Ctor, def);
    return def;
}

/**
 * Returns the component constructor for a given HTMLElement if it can be found
 * @param {HTMLElement} element
 * @return {ComponentConstructor | null}
 */
export function getComponentConstructor(elm: HTMLElement): ComponentConstructor | null {
    let ctor: ComponentConstructor | null = null;
    if (elm instanceof HTMLElement) {
        const vm = getInternalField(elm, ViewModelReflection);
        if (!isUndefined(vm)) {
            ctor = vm.def.ctor;
        }
    }
    return ctor;
}

// Only set prototype for public methods and properties
// No DOM Patching occurs here
export function setElementProto(elm: HTMLElement, def: ComponentDef) {
    setPrototypeOf(elm, def.bridge.prototype);
}

import { HTMLElementOriginalDescriptors } from './html-properties';
import { BaseLightningElement } from './base-lightning-element';
import {
    BaseBridgeElement,
    HTMLBridgeElementFactory,
    HTMLElementConstructor,
} from './base-bridge-element';
import {
    getDecoratorsRegisteredMeta,
    registerDecorators,
    DecoratorMeta,
    PropsDef,
} from './decorators/register';

// Typescript is inferring the wrong function type for this particular
// overloaded method: https://github.com/Microsoft/TypeScript/issues/27972
// @ts-ignore type-mismatch
const HTML_PROPS: PropsDef = ArrayReduce.call(
    getOwnPropertyNames(HTMLElementOriginalDescriptors),
    (props: PropsDef, propName: string): PropsDef => {
        const attrName = getAttrNameFromPropName(propName);
        props[propName] = {
            config: 3,
            type: 'any',
            attr: attrName,
        };
        return props;
    },
    create(null),
);
