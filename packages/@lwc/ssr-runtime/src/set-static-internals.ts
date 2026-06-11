/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    SYMBOL__DEFAULT_TEMPLATE,
    SYMBOL__GENERATE_MARKUP,
    SYMBOL__SET_INTERNALS,
    type LightningElementConstructor,
} from './lightning-element';
import { mutationTracker } from './mutation-tracker';
import { hasScopedStaticStylesheets } from './styles';
import { connectContext, establishContextfulRelationship } from './wire';
import { fallbackTmplNoYield } from './render';
import {
    type GenerateMarkupSync,
    fallbackTmpl,
    renderAttrs,
    renderAttrsNoYield,
    type GenerateMarkupAsyncYield,
} from './render';
import type { Attributes, Properties } from './types';
import type { CompilationMode } from '@lwc/shared';
import type { LightningElement } from './lightning-element';
import type { WireAdapterConstructor } from '@lwc/engine-core';

interface Template {
    (...args: never[]): unknown;
    hasScopedStylesheets?: boolean;
    stylesheetScopeToken?: string;
}

interface ComponentStaticInternals {
    __lwcPublicProperties__?: Set<string>;
    [SYMBOL__DEFAULT_TEMPLATE]: Template;
}

interface WireAdapterInfo<Config extends object = object, Value = unknown> {
    adapter:
        | WireAdapterConstructor<Config, Value>
        | { adapter: WireAdapterConstructor<Config, Value> };
    dataCallback: (cmp: LightningElement) => (newValue: Value) => void;
    config: (cmp: LightningElement) => Config;
}

function connectWires(
    cmp: LightningElement,
    adapter: WireAdapterConstructor | { adapter: WireAdapterConstructor },
    makeDataCallback: (cmp: LightningElement) => (value: unknown) => void, // generated
    getLiveConfig: (cmp: LightningElement) => object // generated
) {
    // Callable adapters are expressed as a function having an 'adapter' property, which
    // is the actual wire constructor.
    const AdapterCtor = 'adapter' in adapter ? adapter.adapter : adapter;
    const wireInstance = new AdapterCtor(makeDataCallback(cmp));
    wireInstance.connect?.();
    if (wireInstance.update) {
        // This may look a bit weird, in that the 'update' function is called twice: once with
        // an 'undefined' value and possibly again with a context-provided value. While weird,
        // this preserves the behavior of the browser-side wire implementation as well as the
        // original SSR implementation.
        wireInstance.update(getLiveConfig(cmp), undefined);
        connectContext(AdapterCtor, cmp, (newContextValue) => {
            wireInstance.update(getLiveConfig(cmp), newContextValue);
        });
    }
}

function createComponent<T extends Template>(
    Component: LightningElementConstructor & ComponentStaticInternals,
    publicProps: Set<string>,
    wireAdapters: WireAdapterInfo[] | null,
    tagName: string,
    props: Properties,
    attrs: Attributes,
    contextfulParent: LightningElement | null,
    defaultTmpl: T
) {
    const instance = new Component({
        tagName: tagName.toUpperCase(),
    });

    establishContextfulRelationship(contextfulParent, instance);
    instance[SYMBOL__SET_INTERNALS](props, attrs, publicProps);
    if (wireAdapters?.length) {
        for (const {
            adapter,
            dataCallback: makeDataCallback,
            config: getLiveConfig,
        } of wireAdapters) {
            connectWires(instance, adapter, makeDataCallback, getLiveConfig);
        }
    }
    instance.isConnected = true;

    if (instance.connectedCallback) {
        mutationTracker.enable(instance);
        instance.connectedCallback();
        mutationTracker.disable(instance);
    }

    // If a render() function is defined on the class or any of its superclasses, then that takes priority.
    // Next, if the class or any of its superclasses has an implicitly-associated template, then that takes
    // second priority (e.g. a foo.html file alongside a foo.js file). Finally, there is a fallback empty template.
    const renderTemplate =
        (instance.render?.() as T) ?? (Component[SYMBOL__DEFAULT_TEMPLATE] as T) ?? defaultTmpl;
    const hostHasScopedStylesheets =
        renderTemplate.hasScopedStylesheets || hasScopedStaticStylesheets(Component);
    const hostScopeToken = hostHasScopedStylesheets
        ? renderTemplate.stylesheetScopeToken + '-host'
        : undefined;

    return { instance, hostScopeToken, renderTemplate };
}

function makeGenerateMarkupAsyncYield(
    Component: LightningElementConstructor & ComponentStaticInternals,
    defaultTagName: string,
    publicProps: Set<string>,
    wireAdapters: WireAdapterInfo[]
): GenerateMarkupAsyncYield {
    return async function* generateMarkup(
        tagName,
        props,
        attrs,
        scopeToken,
        contextfulParent,
        renderContext,
        shadowSlottedContent,
        lightSlottedContent,
        scopedSlottedContent
    ) {
        props ??= Object.create(null) as Properties;
        attrs ??= Object.create(null) as Attributes;
        tagName ??= defaultTagName;

        const { instance, hostScopeToken, renderTemplate } = createComponent(
            Component,
            publicProps,
            wireAdapters,
            tagName,
            props,
            attrs,
            contextfulParent,
            fallbackTmpl
        );

        yield `<${tagName}`;
        yield* renderAttrs(instance, attrs, hostScopeToken, scopeToken!);
        yield '>';
        yield* renderTemplate(
            shadowSlottedContent,
            lightSlottedContent,
            scopedSlottedContent,
            Component,
            instance,
            renderContext
        );
        yield `</${tagName}>`;
    };
}

function makeGenerateMarkupSync(
    Component: LightningElementConstructor & ComponentStaticInternals,
    defaultTagName: string,
    publicProps: Set<string>,
    wireAdapters: WireAdapterInfo[]
): GenerateMarkupSync {
    return function generateMarkup(
        tagName,
        props,
        attrs,
        scopeToken,
        contextfulParent,
        renderContext,
        shadowSlottedContent,
        lightSlottedContent,
        scopedSlottedContent
    ) {
        props ??= Object.create(null) as Properties;
        attrs ??= Object.create(null) as Attributes;
        tagName ??= defaultTagName;

        const { instance, hostScopeToken, renderTemplate } = createComponent(
            Component,
            publicProps,
            wireAdapters,
            tagName,
            props,
            attrs,
            contextfulParent,
            fallbackTmplNoYield
        );

        let markup = `<${tagName}`;
        markup += renderAttrsNoYield(instance, attrs, hostScopeToken, scopeToken);
        markup += '>';
        markup += renderTemplate(
            shadowSlottedContent,
            lightSlottedContent,
            scopedSlottedContent,
            Component,
            instance,
            renderContext
        );
        markup += `</${tagName}>`;
        return markup;
    };
}

export function setStaticInternals(
    Component: LightningElementConstructor & ComponentStaticInternals,
    defaultTagName: string,
    cmpPublicProps: string[],
    wireAdapters: WireAdapterInfo[],
    compilationMode: CompilationMode,
    defaultTemplate?: Template
): void {
    const SuperClass: ComponentStaticInternals = Object.getPrototypeOf(Component);
    const superPublicProps = SuperClass.__lwcPublicProperties__ ?? [];
    const publicProps = new Set([...cmpPublicProps, ...superPublicProps]);

    Object.defineProperty(Component, '__lwcPublicProperties__', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: publicProps,
    });

    Object.defineProperty(Component, SYMBOL__GENERATE_MARKUP, {
        configurable: false,
        enumerable: false,
        writable: false,
        value:
            compilationMode === 'asyncYield'
                ? makeGenerateMarkupAsyncYield(Component, defaultTagName, publicProps, wireAdapters)
                : makeGenerateMarkupSync(Component, defaultTagName, publicProps, wireAdapters),
    });

    if (defaultTemplate) {
        Object.defineProperty(Component, SYMBOL__DEFAULT_TEMPLATE, {
            configurable: false,
            enumerable: false,
            writable: false,
            value: defaultTemplate,
        });
    }
}
