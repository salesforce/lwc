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
    assert,
    assign,
    create,
    defineProperties,
    fields,
    freeze,
    getPrototypeOf,
    isFunction,
    isNull,
    isUndefined,
    setPrototypeOf,
    keys,
} from '@lwc/shared';
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

export interface ComponentDef {
    name: string;
    wire: PropertyDescriptorMap | undefined;
    props: PropertyDescriptorMap;
    methods: PropertyDescriptorMap;
    template: Template;
    ctor: ComponentConstructor;
    bridge: HTMLElementConstructor;
    connectedCallback?: () => void;
    disconnectedCallback?: () => void;
    renderedCallback?: () => void;
    errorCallback?: ErrorCallback;
    render: () => Template;
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
    const decoratorsMeta = getDecoratorsMeta(Ctor);
    const { apiFields, apiMethods, wiredFields, wiredMethods, observedFields } = decoratorsMeta;
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
            ? getComponentInternalDef(superProto, subclassComponentName)
            : lightingElementDef;
    const SuperBridge = isNull(superDef) ? BaseBridgeElement : superDef.bridge;
    const bridge = HTMLBridgeElementFactory(SuperBridge, keys(apiFields), keys(apiMethods));
    const props: PropertyDescriptorMap = assign(create(null), superDef.props, apiFields);
    const methods: PropertyDescriptorMap = assign(create(null), superDef.methods, apiMethods);
    const wire: PropertyDescriptorMap = assign(
        create(null),
        superDef.wire,
        wiredFields,
        wiredMethods
    );
    connectedCallback = connectedCallback || superDef.connectedCallback;
    disconnectedCallback = disconnectedCallback || superDef.disconnectedCallback;
    renderedCallback = renderedCallback || superDef.renderedCallback;
    errorCallback = errorCallback || superDef.errorCallback;
    render = render || superDef.render;
    template = template || superDef.template;

    // installing observed fields into the prototype
    // TODO: consider move this to instance level fields to match the original
    // semantics of the public fields.
    defineProperties(proto, observedFields);

    const def: ComponentDef = {
        ctor: Ctor,
        name,
        wire,
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

export function getComponentInternalDef(Ctor: any, subclassComponentName?: string): ComponentDef {
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

import { BaseLightningElement, lightningBasedDescriptors } from './base-lightning-element';
import {
    BaseBridgeElement,
    HTMLBridgeElementFactory,
    HTMLElementConstructor,
} from './base-bridge-element';
import { getDecoratorsMeta } from './decorators/register';
import { defaultEmptyTemplate } from './secure-template';

const lightingElementDef: ComponentDef = {
    ctor: BaseLightningElement,
    name: BaseLightningElement.name,
    props: lightningBasedDescriptors,
    methods: EmptyObject,
    wire: EmptyObject,
    bridge: BaseBridgeElement,
    template: defaultEmptyTemplate,
    render: BaseLightningElement.prototype.render,
};

// TODO: remove experimental public API getComponentDef
interface PropDef {
    config: number;
    type: string;
    attr: string;
}
type PublicMethod = (...args: any[]) => any;
interface PublicComponentDef {
    name: string;
    props: Record<string, PropDef>;
    methods: Record<string, PublicMethod>;
    ctor: ComponentConstructor;
}

/**
 * EXPERIMENTAL: This function allows for the collection of internal
 * component metadata. This API is subject to change or being removed.
 */
export function getComponentDef(Ctor: any, subclassComponentName?: string): PublicComponentDef {
    const def = getComponentInternalDef(Ctor, subclassComponentName);
    // From the internal def object, we need to extract the info that is useful
    // for some external services, e.g.: Locker Service, usually, all they care
    // is about the shape of the constructor, the internals of it are not relevant
    // because they don't have a way to mess with that.
    const { ctor, name, props, methods } = def;
    const publicProps: Record<string, PropDef> = {};
    for (const key in props) {
        // avoid leaking the reference to the public props descriptors
        publicProps[key] = {
            config: 0, // always a property
            type: 'any', // no type inference for public services
            attr: getAttrNameFromPropName(key),
        };
    }
    const publicMethods: Record<string, PublicMethod> = {};
    for (const key in methods) {
        // avoid leaking the reference to the public method descriptors
        publicMethods[key] = methods[key].value as (...args: any[]) => any;
    }
    return {
        ctor,
        name,
        props: publicProps,
        methods: publicMethods,
    };
}
