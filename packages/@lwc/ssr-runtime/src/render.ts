/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { mutationTracker } from './mutation-tracker';
import type { LightningElement, LightningElementConstructor } from './lightning-element';
import type { Attributes } from './types';

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
    props: Record<string, any> | null,
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

export async function serverSideRenderComponent(
    tagName: string,
    compiledGenerateMarkup: GenerateMarkupFnVariants,
    props: Record<string, any>,
    mode: 'asyncYield' | 'async' | 'sync' = 'asyncYield'
): Promise<string> {
    let markup = '';

    if (mode === 'asyncYield') {
        for await (const segment of (compiledGenerateMarkup as GenerateMarkupFn)(
            tagName,
            props,
            null,
            null
        )) {
            markup += segment;
        }
    } else if (mode === 'async') {
        const emit = (segment: string) => {
            markup += segment;
        };
        await (compiledGenerateMarkup as GenerateMarkupFnAsyncNoGen)(
            emit,
            tagName,
            props,
            null,
            null
        );
    } else if (mode === 'sync') {
        const emit = (segment: string) => {
            markup += segment;
        };
        (compiledGenerateMarkup as GenerateMarkupFnSyncNoGen)(emit, tagName, props, null, null);
    } else {
        throw new Error(`Invalid mode: ${mode}`);
    }

    return markup;
}
