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
    assign,
    create,
    defineProperties,
    freeze,
    getPrototypeOf,
    htmlPropertyToAttribute,
    isFunction,
    isNull,
    isUndefined,
    keys,
} from '@lwc/shared';

import { RenderMode, ShadowSupportMode } from '../framework/vm';
import {
    isCircularModuleDependency,
    resolveCircularModuleDependency,
} from '../shared/circular-module-dependencies';

import { logError, logWarn } from '../shared/logger';
import { instrumentDef } from './runtime-instrumentation';
import { EmptyObject } from './utils';
import { getComponentRegisteredTemplate } from './component';
import { Template } from './template';
import { LightningElement, LightningElementConstructor } from './base-lightning-element';
import { lightningBasedDescriptors } from './base-lightning-element';
import { PropType, getDecoratorsMeta } from './decorators/register';
import { defaultEmptyTemplate } from './secure-template';

import {
    BaseBridgeElement,
    HTMLBridgeElementFactory,
    HTMLElementConstructor,
} from './base-bridge-element';
import { getComponentOrSwappedComponent } from './hot-swaps';

export interface ComponentDef {
    name: string;
    wire: PropertyDescriptorMap | undefined;
    props: PropertyDescriptorMap;
    propsConfig: Record<string, PropType>;
    methods: PropertyDescriptorMap;
    template: Template;
    renderMode: RenderMode;
    shadowSupportMode: ShadowSupportMode;
    formAssociated: boolean | undefined;
    ctor: LightningElementConstructor;
    bridge: HTMLElementConstructor;
    connectedCallback?: LightningElement['connectedCallback'];
    disconnectedCallback?: LightningElement['disconnectedCallback'];
    renderedCallback?: LightningElement['renderedCallback'];
    errorCallback?: LightningElement['errorCallback'];
    formAssociatedCallback?: LightningElement['formAssociatedCallback'];
    formResetCallback?: LightningElement['formResetCallback'];
    formDisabledCallback?: LightningElement['formDisabledCallback'];
    formStateRestoreCallback?: LightningElement['formStateRestoreCallback'];
    render: LightningElement['render'];
}

const CtorToDefMap: WeakMap<any, ComponentDef> = new WeakMap();

function getCtorProto(Ctor: LightningElementConstructor): LightningElementConstructor {
    let proto: LightningElementConstructor | null = getPrototypeOf(Ctor);
    if (isNull(proto)) {
        throw new ReferenceError(
            `Invalid prototype chain for ${Ctor.name}, you must extend LightningElement.`
        );
    }
    // covering the cases where the ref is circular in AMD
    if (isCircularModuleDependency(proto)) {
        const p = resolveCircularModuleDependency(proto);
        if (process.env.NODE_ENV !== 'production') {
            if (isNull(p)) {
                throw new ReferenceError(
                    `Circular module dependency for ${Ctor.name}, must resolve to a constructor that extends LightningElement.`
                );
            }
        }
        // escape hatch for Locker and other abstractions to provide their own base class instead
        // of our Base class without having to leak it to user-land. If the circular function returns
        // itself, that's the signal that we have hit the end of the proto chain, which must always
        // be base.
        proto = p === proto ? LightningElement : p;
    }
    return proto!;
}

function createComponentDef(Ctor: LightningElementConstructor): ComponentDef {
    const {
        shadowSupportMode: ctorShadowSupportMode,
        renderMode: ctorRenderMode,
        formAssociated: ctorFormAssociated,
    } = Ctor;

    if (process.env.NODE_ENV !== 'production') {
        const ctorName = Ctor.name;
        // Removing the following assert until https://bugs.webkit.org/show_bug.cgi?id=190140 is fixed.
        // assert.isTrue(ctorName && isString(ctorName), `${toString(Ctor)} should have a "name" property with string value, but found ${ctorName}.`);

        if (!Ctor.constructor) {
            // This error seems impossible to hit, due to an earlier check in `isComponentConstructor()`.
            // But we keep it here just in case.
            logError(
                `Missing ${ctorName}.constructor, ${ctorName} should have a "constructor" property.`
            );
        }

        if (
            !isUndefined(ctorShadowSupportMode) &&
            ctorShadowSupportMode !== ShadowSupportMode.Any &&
            ctorShadowSupportMode !== ShadowSupportMode.Default &&
            ctorShadowSupportMode !== ShadowSupportMode.Native
        ) {
            logError(
                `Invalid value for static property shadowSupportMode: '${ctorShadowSupportMode}'`
            );
        }

        // TODO [#3971]: Completely remove shadowSupportMode "any"
        if (ctorShadowSupportMode === ShadowSupportMode.Any) {
            logWarn(
                `Invalid value 'any' for static property shadowSupportMode. 'any' is deprecated and will be removed in a future release--use 'native' instead.`
            );
        }

        if (
            !isUndefined(ctorRenderMode) &&
            ctorRenderMode !== 'light' &&
            ctorRenderMode !== 'shadow'
        ) {
            logError(
                `Invalid value for static property renderMode: '${ctorRenderMode}'. renderMode must be either 'light' or 'shadow'.`
            );
        }
    }

    const decoratorsMeta = getDecoratorsMeta(Ctor);
    const { apiFields, apiFieldsConfig, apiMethods, wiredFields, wiredMethods, observedFields } =
        decoratorsMeta;
    const proto = Ctor.prototype;

    let {
        connectedCallback,
        disconnectedCallback,
        renderedCallback,
        errorCallback,
        formAssociatedCallback,
        formResetCallback,
        formDisabledCallback,
        formStateRestoreCallback,
        render,
    } = proto;
    const superProto = getCtorProto(Ctor);
    const hasCustomSuperClass = superProto !== LightningElement;
    const superDef = hasCustomSuperClass ? getComponentInternalDef(superProto) : lightingElementDef;
    const bridge = HTMLBridgeElementFactory(
        superDef.bridge,
        keys(apiFields),
        keys(apiMethods),
        keys(observedFields),
        proto,
        hasCustomSuperClass
    );
    const props: PropertyDescriptorMap = assign(create(null), superDef.props, apiFields);
    const propsConfig = assign(create(null), superDef.propsConfig, apiFieldsConfig);
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
    formAssociatedCallback = formAssociatedCallback || superDef.formAssociatedCallback;
    formResetCallback = formResetCallback || superDef.formResetCallback;
    formDisabledCallback = formDisabledCallback || superDef.formDisabledCallback;
    formStateRestoreCallback = formStateRestoreCallback || superDef.formStateRestoreCallback;
    render = render || superDef.render;

    let shadowSupportMode = superDef.shadowSupportMode;
    if (!isUndefined(ctorShadowSupportMode)) {
        shadowSupportMode = ctorShadowSupportMode;
    }

    let renderMode = superDef.renderMode;
    if (!isUndefined(ctorRenderMode)) {
        renderMode = ctorRenderMode === 'light' ? RenderMode.Light : RenderMode.Shadow;
    }

    let formAssociated = superDef.formAssociated;
    if (!isUndefined(ctorFormAssociated)) {
        formAssociated = ctorFormAssociated;
    }

    const template = getComponentRegisteredTemplate(Ctor) || superDef.template;
    const name = Ctor.name || superDef.name;

    // installing observed fields into the prototype.
    defineProperties(proto, observedFields);

    const def: ComponentDef = {
        ctor: Ctor,
        name,
        wire,
        props,
        propsConfig,
        methods,
        bridge,
        template,
        renderMode,
        shadowSupportMode,
        formAssociated,
        connectedCallback,
        disconnectedCallback,
        errorCallback,
        formAssociatedCallback,
        formDisabledCallback,
        formResetCallback,
        formStateRestoreCallback,
        renderedCallback,
        render,
    };

    // This is a no-op unless Lightning DevTools are enabled.
    instrumentDef(def);

    if (process.env.NODE_ENV !== 'production') {
        freeze(Ctor.prototype);
    }
    return def;
}

/**
 * EXPERIMENTAL: This function allows for the identification of LWC constructors. This API is
 * subject to change or being removed.
 */
export function isComponentConstructor(ctor: unknown): ctor is LightningElementConstructor {
    if (!isFunction(ctor)) {
        return false;
    }

    // Fast path: LightningElement is part of the prototype chain of the constructor.
    if (ctor.prototype instanceof LightningElement) {
        return true;
    }

    // Slow path: LightningElement is not part of the prototype chain of the constructor, we need
    // climb up the constructor prototype chain to check in case there are circular dependencies
    // to resolve.
    let current = ctor;
    do {
        if (isCircularModuleDependency(current)) {
            const circularResolved = resolveCircularModuleDependency(current);

            // If the circular function returns itself, that's the signal that we have hit the end
            // of the proto chain, which must always be a valid base constructor.
            if (circularResolved === current) {
                return true;
            }

            current = circularResolved;
        }

        if (current === LightningElement) {
            return true;
        }
    } while (!isNull(current) && (current = getPrototypeOf(current)));

    // Finally return false if the LightningElement is not part of the prototype chain.
    return false;
}

export function getComponentInternalDef(Ctor: unknown): ComponentDef {
    if (process.env.NODE_ENV !== 'production') {
        Ctor = getComponentOrSwappedComponent(Ctor as LightningElementConstructor);
    }
    let def = CtorToDefMap.get(Ctor);

    if (isUndefined(def)) {
        if (isCircularModuleDependency(Ctor)) {
            const resolvedCtor = resolveCircularModuleDependency(Ctor);
            def = getComponentInternalDef(resolvedCtor);
            // Cache the unresolved component ctor too. The next time if the same unresolved ctor is used,
            // look up the definition in cache instead of re-resolving and recreating the def.
            CtorToDefMap.set(Ctor, def);
            return def;
        }

        if (!isComponentConstructor(Ctor)) {
            throw new TypeError(
                `${Ctor} is not a valid component, or does not extends LightningElement from "lwc". You probably forgot to add the extend clause on the class declaration.`
            );
        }

        def = createComponentDef(Ctor);
        CtorToDefMap.set(Ctor, def);
    }

    return def;
}

export function getComponentHtmlPrototype(Ctor: unknown): HTMLElementConstructor {
    const def = getComponentInternalDef(Ctor);
    return def.bridge;
}

const lightingElementDef: ComponentDef = {
    ctor: LightningElement,
    name: LightningElement.name,
    props: lightningBasedDescriptors,
    propsConfig: EmptyObject,
    methods: EmptyObject,
    renderMode: RenderMode.Shadow,
    shadowSupportMode: ShadowSupportMode.Default,
    formAssociated: undefined,
    wire: EmptyObject,
    bridge: BaseBridgeElement,
    template: defaultEmptyTemplate,
    render: LightningElement.prototype.render,
};

const enum PropDefType {
    any = 'any',
}

interface PropDef {
    config: number;
    type: PropDefType;
    attr: string;
}
type PublicMethod = (...args: any[]) => any;
interface PublicComponentDef {
    name: string;
    props: Record<string, PropDef>;
    methods: Record<string, PublicMethod>;
    ctor: LightningElementConstructor;
}

/**
 * EXPERIMENTAL: This function allows for the collection of internal component metadata. This API is
 * subject to change or being removed.
 */
export function getComponentDef(Ctor: any): PublicComponentDef {
    const def = getComponentInternalDef(Ctor);
    // From the internal def object, we need to extract the info that is useful
    // for some external services, e.g.: Locker Service, usually, all they care
    // is about the shape of the constructor, the internals of it are not relevant
    // because they don't have a way to mess with that.
    const { ctor, name, props, propsConfig, methods } = def;
    const publicProps: Record<string, PropDef> = {};
    for (const key in props) {
        // avoid leaking the reference to the public props descriptors
        publicProps[key] = {
            config: propsConfig[key] || 0, // a property by default
            type: PropDefType.any, // no type inference for public services
            attr: htmlPropertyToAttribute(key),
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
