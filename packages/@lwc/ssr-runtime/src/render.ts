/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    getOwnPropertyNames,
    isNull,
    isString,
    isUndefined,
    DEFAULT_SSR_MODE,
    htmlEscape,
} from '@lwc/shared';
import { mutationTracker } from './mutation-tracker';
import { SYMBOL__GENERATE_MARKUP } from './lightning-element';
import type { LightningElement, LightningElementConstructor } from './lightning-element';
import type { Attributes, Properties } from './types';

function renderAttrsPrivate(
    instance: LightningElement,
    attrs: Attributes,
    hostScopeToken: string | undefined,
    scopeToken: string | undefined
): string {
    // The scopeToken is e.g. `lwc-xyz123` which is the token our parent gives us.
    // The hostScopeToken is e.g. `lwc-abc456-host` which is the token for our own component.
    // It's possible to have both, one, the other, or neither.
    const combinedScopeToken =
        scopeToken && hostScopeToken
            ? `${scopeToken} ${hostScopeToken}`
            : scopeToken || hostScopeToken || '';

    let result = '';
    let hasClassAttribute = false;

    for (const attrName of getOwnPropertyNames(attrs)) {
        let attrValue = attrs[attrName];

        // Backwards compatibility with historical patchStyleAttribute() behavior:
        // https://github.com/salesforce/lwc/blob/59e2c6c/packages/%40lwc/engine-core/src/framework/modules/computed-style-attr.ts#L40
        if (attrName === 'style' && (!isString(attrValue) || attrValue === '')) {
            // If the style attribute is invalid, we don't render it.
            continue;
        }

        if (isNull(attrValue) || isUndefined(attrValue)) {
            attrValue = '';
        } else if (!isString(attrValue)) {
            attrValue = String(attrValue);
        }

        if (attrName === 'class') {
            if (attrValue === '') {
                // If the class attribute is empty, we don't render it.
                continue;
            }

            if (combinedScopeToken) {
                attrValue += ' ' + combinedScopeToken;
                hasClassAttribute = true;
            }
        }

        result +=
            attrValue === '' ? ` ${attrName}` : ` ${attrName}="${htmlEscape(attrValue, true)}"`;
    }

    // If we didn't render any `class` attribute, render one for the scope token(s)
    if (!hasClassAttribute && combinedScopeToken) {
        result += ` class="${combinedScopeToken}"`;
    }

    // For the host scope token only, we encode a special attribute for hydration
    if (hostScopeToken) {
        result += ` data-lwc-host-scope-token="${hostScopeToken}"`;
    }

    result += mutationTracker.renderMutatedAttrs(instance);

    return result;
}

export function* renderAttrs(
    instance: LightningElement,
    attrs: Attributes,
    hostScopeToken: string | undefined,
    scopeToken: string | undefined
) {
    yield renderAttrsPrivate(instance, attrs, hostScopeToken, scopeToken);
}

export function renderAttrsNoYield(
    emit: (segment: string) => void,
    instance: LightningElement,
    attrs: Attributes,
    hostScopeToken: string | undefined,
    scopeToken: string | undefined
) {
    emit(renderAttrsPrivate(instance, attrs, hostScopeToken, scopeToken));
}

export function* fallbackTmpl(
    _shadowSlottedContent: any,
    _lightSlottedContent: any,
    _scopedSlottedContent: any,
    Cmp: LightningElementConstructor,
    _instance: unknown
) {
    if (Cmp.renderMode !== 'light') {
        yield `<template shadowrootmode="open"></template>`;
        renderSlottedContent(_lightSlottedContent, _instance);
    }
}

export function fallbackTmplNoYield(
    emit: (segment: string) => void,
    _shadowSlottedContent: any,
    _lightSlottedContent: any,
    _scopedSlottedContent: any,
    Cmp: LightningElementConstructor,
    _instance: unknown
) {
    if (Cmp.renderMode !== 'light') {
        emit(`<template shadowrootmode="open"></template>`);
        renderSlottedContent(_lightSlottedContent, emit);
    }
}

function renderSlottedContent(_lightSlottedContent: any, contextfulParent: any) {
    if (_lightSlottedContent) {
        for (const slotName in _lightSlottedContent) {
            const generators = _lightSlottedContent[slotName];
            for (let i = 0; i < generators.length; i++) {
                generators[i](contextfulParent, null, slotName);
            }
        }
    }
}

export type GenerateMarkupFn = (
    tagName: string,
    props: Properties | null,
    attrs: Attributes | null,
    shadowSlottedContent: AsyncGenerator<string> | null,
    lightSlottedContent: Record<number | string, AsyncGenerator<string>> | null,
    scopedSlottedContent: Record<number | string, AsyncGenerator<string>> | null,
    // Not always null when invoked internally, but should always be
    // null when invoked by ssr-runtime
    parent: LightningElement | null,
    scopeToken: string | null,
    contextfulParent: LightningElement | null
) => AsyncGenerator<string>;

export type GenerateMarkupFnAsyncNoGen = (
    emit: (segment: string) => void,
    tagName: string,
    props: Properties | null,
    attrs: Attributes | null,
    shadowSlottedContent: AsyncGenerator<string> | null,
    lightSlottedContent: Record<number | string, AsyncGenerator<string>> | null,
    scopedSlottedContent: Record<number | string, AsyncGenerator<string>> | null,
    // Not always null when invoked internally, but should always be
    // null when invoked by ssr-runtime
    parent: LightningElement | null,
    scopeToken: string | null,
    contextfulParent: LightningElement | null
) => Promise<void>;

export type GenerateMarkupFnSyncNoGen = (
    emit: (segment: string) => void,
    tagName: string,
    props: Properties | null,
    attrs: Attributes | null,
    shadowSlottedContent: AsyncGenerator<string> | null,
    lightSlottedContent: Record<number | string, AsyncGenerator<string>> | null,
    scopedSlottedContent: Record<number | string, AsyncGenerator<string>> | null,
    // Not always null when invoked internally, but should always be
    // null when invoked by ssr-runtime
    parent: LightningElement | null,
    scopeToken: string | null,
    contextfulParent: LightningElement | null
) => void;

type GenerateMarkupFnVariants =
    | GenerateMarkupFn
    | GenerateMarkupFnAsyncNoGen
    | GenerateMarkupFnSyncNoGen;

interface ComponentWithGenerateMarkup {
    [SYMBOL__GENERATE_MARKUP]: GenerateMarkupFnVariants;
}

export async function serverSideRenderComponent(
    tagName: string,
    Component: ComponentWithGenerateMarkup,
    props: Properties = {},
    mode: 'asyncYield' | 'async' | 'sync' = DEFAULT_SSR_MODE
): Promise<string> {
    if (typeof tagName !== 'string') {
        throw new Error(`tagName must be a string, found: ${tagName}`);
    }

    const generateMarkup = Component[SYMBOL__GENERATE_MARKUP];

    let markup = '';
    const emit = (segment: string) => {
        markup += segment;
    };

    if (mode === 'asyncYield') {
        for await (const segment of (generateMarkup as GenerateMarkupFn)(
            tagName,
            props,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        )) {
            markup += segment;
        }
    } else if (mode === 'async') {
        await (generateMarkup as GenerateMarkupFnAsyncNoGen)(
            emit,
            tagName,
            props,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        );
    } else if (mode === 'sync') {
        (generateMarkup as GenerateMarkupFnSyncNoGen)(
            emit,
            tagName,
            props,
            null,
            null,
            null,
            null,
            null,
            null,
            null
        );
    } else {
        throw new Error(`Invalid mode: ${mode}`);
    }

    return markup;
}
