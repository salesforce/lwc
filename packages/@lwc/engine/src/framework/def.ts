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

import {
    ArrayReduce,
    assert,
    assign,
    create,
    defineProperties,
    fields,
    freeze,
    getOwnPropertyNames,
    getPrototypeOf,
    isFunction,
    isNull,
    isUndefined,
    setPrototypeOf,
} from '@lwc/shared';
import { getAttrNameFromPropName } from './attributes';
import {
    resolveCircularModuleDependency,
    isCircularModuleDependency,
    ViewModelReflection,
} from './utils';
import {
    ComponentConstructor,
    ErrorCallback,
    ComponentMeta,
    getComponentRegisteredMeta,
} from './component';
import { createObservedFieldsDescriptorMap } from './observed-fields';
import { Template } from './template';

export interface ComponentDef extends DecoratorMeta {
    name: string;
    template: Template;
    ctor: ComponentConstructor;
    bridge: HTMLElementConstructor;
    connectedCallback?: () => void;
    disconnectedCallback?: () => void;
    renderedCallback?: () => void;
    render: () => Template;
    errorCallback?: ErrorCallback;
}

const CtorToDefMap: WeakMap<any, ComponentDef> = new WeakMap();
const { getHiddenField } = fields;

function getCtorProto(Ctor: any, subclassComponentName: string): ComponentConstructor {
    let proto: ComponentConstructor | null = getPrototypeOf(Ctor);
    if (isNull(proto)) {
        throw new ReferenceError(
            `Invalid prototype chain for ${subclassComponentName}, you must extend LightningElement.`
        );
    }
    // covering the cases where the ref is circular in AMD
    if (isCircularModuleDependency(proto)) {
        const p = resolveCircularModuleDependency(proto);
        if (process.env.NODE_ENV !== 'production') {
            if (isNull(p)) {
                throw new ReferenceError(
                    `Circular module dependency for ${subclassComponentName}, must resolve to a constructor that extends LightningElement.`
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

function createComponentDef(
    Ctor: ComponentConstructor,
    meta: ComponentMeta,
    subclassComponentName: string
): ComponentDef {
    if (process.env.NODE_ENV !== 'production') {
        // local to dev block
        const ctorName = Ctor.name;
        // Removing the following assert until https://bugs.webkit.org/show_bug.cgi?id=190140 is fixed.
        // assert.isTrue(ctorName && isString(ctorName), `${toString(Ctor)} should have a "name" property with string value, but found ${ctorName}.`);
        assert.isTrue(
            Ctor.constructor,
            `Missing ${ctorName}.constructor, ${ctorName} should have a "constructor" property.`
        );
    }

    const { name } = meta;
    let { template } = meta;
    const decoratorsMeta = getDecoratorsRegisteredMeta(Ctor);
    let props: PropsDef = {};
    let methods: MethodDef = {};
    let wire: WireHash | undefined;
    let track: TrackDef = {};
    let fields: string[] | undefined;
    if (!isUndefined(decoratorsMeta)) {
        props = decoratorsMeta.props;
        methods = decoratorsMeta.methods;
        wire = decoratorsMeta.wire;
        track = decoratorsMeta.track;
        fields = decoratorsMeta.fields;
    }
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
        getOwnPropertyNames(methods)
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
        template = template || superDef.template;
    }
    props = assign(create(null), HTML_PROPS, props);

    if (!isUndefined(fields)) {
        defineProperties(proto, createObservedFieldsDescriptorMap(fields));
    }

    if (isUndefined(template)) {
        // default template
        template = defaultEmptyTemplate;
    }

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

/**
 * EXPERIMENTAL: This function allows for the identification of LWC
 * constructors. This API is subject to change or being removed.
 */
export function isComponentConstructor(ctor: any): ctor is ComponentConstructor {
    if (!isFunction(ctor)) {
        return false;
    }

    // Fast path: LightningElement is part of the prototype chain of the constructor.
    if (ctor.prototype instanceof BaseLightningElement) {
        return true;
    }

    // Slow path: LightningElement is not part of the prototype chain of the constructor, we need
    // climb up the constructor prototype chain to check in case there are circular dependencies
    // to resolve.
    let current = ctor;
    do {
        if (isCircularModuleDependency(current)) {
            const circularResolved = resolveCircularModuleDependency(current);

            // If the circular function returns itself, that's the signal that we have hit the end of the proto chain,
            // which must always be a valid base constructor.
            if (circularResolved === current) {
                return true;
            }

            current = circularResolved;
        }

        if (current === BaseLightningElement) {
            return true;
        }
    } while (!isNull(current) && (current = getPrototypeOf(current)));

    // Finally return false if the LightningElement is not part of the prototype chain.
    return false;
}

/**
 * EXPERIMENTAL: This function allows for the collection of internal
 * component metadata. This API is subject to change or being removed.
 */
export function getComponentDef(Ctor: any, subclassComponentName?: string): ComponentDef {
    let def = CtorToDefMap.get(Ctor);

    if (isUndefined(def)) {
        if (!isComponentConstructor(Ctor)) {
            throw new TypeError(
                `${Ctor} is not a valid component, or does not extends LightningElement from "lwc". You probably forgot to add the extend clause on the class declaration.`
            );
        }

        let meta = getComponentRegisteredMeta(Ctor);
        if (isUndefined(meta)) {
            // TODO: #1295 - remove this workaround after refactoring tests
            meta = {
                template: undefined,
                name: Ctor.name,
            };
        }

        def = createComponentDef(Ctor, meta, subclassComponentName || Ctor.name);
        CtorToDefMap.set(Ctor, def);
    }

    return def;
}

/**
 * EXPERIMENTAL: This function provides access to the component constructor,
 * given an HTMLElement. This API is subject to change or being removed.
 */
export function getComponentConstructor(elm: HTMLElement): ComponentConstructor | null {
    let ctor: ComponentConstructor | null = null;
    if (elm instanceof HTMLElement) {
        const vm = getHiddenField(elm, ViewModelReflection);
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
    DecoratorMeta,
    PropsDef,
    WireHash,
    MethodDef,
    TrackDef,
} from './decorators/register';
import { defaultEmptyTemplate } from './secure-template';

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
    create(null)
);
