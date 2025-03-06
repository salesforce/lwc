/*
 * Copyright (c) 2025, Salesforce, Inc.
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
    type Stylesheet,
} from '@lwc/shared';
import { mutationTracker } from './mutation-tracker';
import { SYMBOL__GENERATE_MARKUP } from './lightning-element';
import type { CompilationMode } from '@lwc/shared';
import type { LightningElement, LightningElementConstructor } from './lightning-element';
import type { Attributes, Properties } from './types';

/** Parameters used by all `generateMarkup` variants that don't get transmogrified. */
type BaseGenerateMarkupParams = readonly [
    tagName: string,
    props: Properties | null,
    attrs: Attributes | null,
    // Not always null when invoked internally, but should always be
    // null when invoked by ssr-runtime
    parent: LightningElement | null,
    scopeToken: string | null,
    contextfulParent: LightningElement | null,
];

/** Text emitter used by transmogrified formats. */
type Emit = (str: string) => void;

/** Slotted content function used by `asyncYield` mode. */
type SlottedContentGenerator = (
    instance: LightningElement
) => AsyncGenerator<string, void, unknown>;
/** Slotted content function used by `sync` and `async` modes. */
type SlottedContentEmitter = ($$emit: Emit, instance: LightningElement) => void;

/** Slotted content map used by `asyncYield` mode. */
type SlottedContentGeneratorMap = Record<number | string, SlottedContentGenerator[]>;
/** Slotted content map used by `sync` and `async` modes. */
type SlottedContentEmitterMap = Record<number | string, SlottedContentEmitter[]>;

/** `generateMarkup` parameters used by `asyncYield` mode. */
type GenerateMarkupGeneratorParams = readonly [
    ...BaseGenerateMarkupParams,
    shadowSlottedContent: SlottedContentGenerator | null,
    lightSlottedContent: SlottedContentGeneratorMap | null,
    scopedSlottedContent: SlottedContentGeneratorMap | null,
];
/** `generateMarkup` parameters used by `sync` and `async` modes. */
type GenerateMarkupEmitterParams = readonly [
    emit: Emit,
    ...BaseGenerateMarkupParams,
    shadowSlottedContent: SlottedContentEmitter | null,
    lightSlottedContent: SlottedContentEmitterMap | null,
    scopedSlottedContent: SlottedContentEmitterMap | null,
];

/** Signature for `asyncYield` compilation mode. */
export type GenerateMarkupAsyncYield = (
    ...args: GenerateMarkupGeneratorParams
) => AsyncGenerator<string>;
/** Signature for `async` compilation mode. */
export type GenerateMarkupAsync = (...args: GenerateMarkupEmitterParams) => Promise<void>;
/** Signature for `sync` compilation mode. */
export type GenerateMarkupSync = (...args: GenerateMarkupEmitterParams) => void;

type GenerateMarkupVariants = GenerateMarkupAsyncYield | GenerateMarkupAsync | GenerateMarkupSync;

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

export async function* fallbackTmpl(
    shadowSlottedContent: SlottedContentGenerator | null,
    _lightSlottedContent: SlottedContentGeneratorMap | null,
    _scopedSlottedContent: SlottedContentGeneratorMap | null,
    Cmp: LightningElementConstructor,
    instance: LightningElement
): AsyncGenerator<string> {
    if (Cmp.renderMode !== 'light') {
        yield `<template shadowrootmode="open"></template>`;
        if (shadowSlottedContent) {
            yield* shadowSlottedContent(instance);
        }
    }
}

export function fallbackTmplNoYield(
    emit: Emit,
    shadowSlottedContent: SlottedContentEmitter | null,
    _lightSlottedContent: SlottedContentEmitterMap | null,
    _scopedSlottedContent: SlottedContentEmitterMap | null,
    Cmp: LightningElementConstructor,
    instance: LightningElement
): void {
    if (Cmp.renderMode !== 'light') {
        emit(`<template shadowrootmode="open"></template>`);
        if (shadowSlottedContent) {
            shadowSlottedContent(emit, instance);
        }
    }
}

interface ComponentWithGenerateMarkup extends LightningElementConstructor {
    [SYMBOL__GENERATE_MARKUP]?: GenerateMarkupVariants;
}

export class RenderContext {
    styleDedupeIsEnabled: boolean;
    styleDedupePrefix: string;
    stylesheetToId = new WeakMap<Stylesheet, string>();
    nextId = 0;

    constructor(styleDedupe: string | boolean) {
        if (styleDedupe || styleDedupe === '') {
            this.styleDedupePrefix = styleDedupe && '';
            this.styleDedupeIsEnabled = true;
        } else {
            this.styleDedupePrefix = '';
            this.styleDedupeIsEnabled = false;
        }
    }
}

export async function serverSideRenderComponent(
    tagName: string,
    Component: ComponentWithGenerateMarkup,
    props: Properties = {},
    styleDedupe: string | boolean = '',
    mode: CompilationMode = DEFAULT_SSR_MODE
): Promise<string> {
    if (typeof tagName !== 'string') {
        throw new Error(`tagName must be a string, found: ${tagName}`);
    }

    const generateMarkup = Component[SYMBOL__GENERATE_MARKUP];

    let markup = '';
    const emit = (segment: string) => {
        markup += segment;
    };

    emit.cxt = new RenderContext(styleDedupe);

    if (!generateMarkup) {
        // If a non-component is accidentally provided, render an empty template
        emit(`<${tagName}>`);
        // Using a false type assertion for the `instance` param is safe because it's only used
        // if there's slotted content, which we are not providing
        fallbackTmplNoYield(emit, null, null, null, Component, null as any);
        emit(`</${tagName}>`);
        return markup;
    }

    if (mode === 'asyncYield') {
        for await (const segment of (generateMarkup as GenerateMarkupAsyncYield)(
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
        await (generateMarkup as GenerateMarkupAsync)(
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
        (generateMarkup as GenerateMarkupSync)(
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
