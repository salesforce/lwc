/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { mutationTracker } from './mutation-tracker';
import {
    LightningElement,
    LightningElementConstructor,
    SYMBOL__GENERATE_MARKUP,
} from './lightning-element';
import type { Attributes, Properties } from './types';

const escapeAttrVal = (attrVal: string) =>
    attrVal.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

export function* renderAttrs(instance: LightningElement, attrs: Attributes) {
    if (!attrs) {
        return;
    }
    for (const attrName of Object.getOwnPropertyNames(attrs)) {
        const attrVal = attrs[attrName];
        if (typeof attrVal === 'string') {
            yield attrVal === '' ? ` ${attrName}` : ` ${attrName}="${escapeAttrVal(attrVal)}"`;
        } else if (attrVal === null) {
            yield '';
        }
    }
    yield mutationTracker.renderMutatedAttrs(instance);
}

export function renderAttrsNoYield(
    emit: (segment: string) => void,
    instance: LightningElement,
    attrs: Attributes
) {
    if (!attrs) {
        return;
    }
    for (const attrName of Object.getOwnPropertyNames(attrs)) {
        const attrVal = attrs[attrName];
        if (typeof attrVal === 'string') {
            emit(attrVal === '' ? ` ${attrName}` : ` ${attrName}="${escapeAttrVal(attrVal)}"`);
        } else if (attrVal === null) {
            emit('');
        }
    }
    emit(mutationTracker.renderMutatedAttrs(instance));
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
        (Component as ComponentWithGenerateMarkup)[SYMBOL__GENERATE_MARKUP] ?? Component;

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
