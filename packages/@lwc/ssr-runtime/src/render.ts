/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { getOwnPropertyNames, isNull, isString, isUndefined } from '@lwc/shared';
import { mutationTracker } from './mutation-tracker';
import {
    LightningElement,
    LightningElementConstructor,
    SYMBOL__GENERATE_MARKUP,
} from './lightning-element';
import type { Attributes, Properties } from './types';

const escapeAttrVal = (attrValue: string) =>
    attrValue.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

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
        if (isNull(attrValue) || isUndefined(attrValue)) {
            attrValue = '';
        } else if (!isString(attrValue)) {
            attrValue = String(attrValue);
        }
        if (combinedScopeToken && attrName === 'class') {
            attrValue += ' ' + combinedScopeToken;
            hasClassAttribute = true;
        }

        result += attrValue === '' ? ` ${attrName}` : ` ${attrName}="${escapeAttrVal(attrValue)}"`;
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
    _props: unknown,
    _attrs: unknown,
    _slotted: unknown,
    Cmp: LightningElementConstructor,
    _instance: unknown
) {
    if (Cmp.renderMode !== 'light') {
        yield '<template shadowrootmode="open"></template>';
    }
}

export function fallbackTmplNoYield(
    emit: (segment: string) => void,
    _props: unknown,
    _attrs: unknown,
    _slotted: unknown,
    Cmp: LightningElementConstructor,
    _instance: unknown
) {
    if (Cmp.renderMode !== 'light') {
        emit('<template shadowrootmode="open"></template>');
    }
}

export type GenerateMarkupFn = (
    tagName: string,
    props: Properties | null,
    attrs: Attributes | null,
    slotted: Record<number | string, AsyncGenerator<string>> | null
) => AsyncGenerator<string>;

export type GenerateMarkupFnAsyncNoGen = (
    emit: (segment: string) => void,
    tagName: string,
    props: Record<string, any> | null,
    attrs: Attributes | null,
    slotted: Record<number | string, AsyncGenerator<string>> | null
) => Promise<void>;

export type GenerateMarkupFnSyncNoGen = (
    emit: (segment: string) => void,
    tagName: string,
    props: Record<string, any> | null,
    attrs: Attributes | null,
    slotted: Record<number | string, AsyncGenerator<string>> | null
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
    Component: GenerateMarkupFnVariants | ComponentWithGenerateMarkup,
    props: Properties = {},
    mode: 'asyncYield' | 'async' | 'sync' = 'asyncYield'
): Promise<string> {
    if (typeof tagName !== 'string') {
        throw new Error(`tagName must be a string, found: ${tagName}`);
    }

    // TODO [#4726]: remove `generateMarkup` export
    const generateMarkup =
        SYMBOL__GENERATE_MARKUP in Component ? Component[SYMBOL__GENERATE_MARKUP] : Component;

    let markup = '';
    const emit = (segment: string) => {
        markup += segment;
    };

    if (mode === 'asyncYield') {
        for await (const segment of (generateMarkup as GenerateMarkupFn)(
            tagName,
            props,
            null,
            null
        )) {
            markup += segment;
        }
    } else if (mode === 'async') {
        await (generateMarkup as GenerateMarkupFnAsyncNoGen)(emit, tagName, props, null, null);
    } else if (mode === 'sync') {
        (generateMarkup as GenerateMarkupFnSyncNoGen)(emit, tagName, props, null, null);
    } else {
        throw new Error(`Invalid mode: ${mode}`);
    }

    return markup;
}
