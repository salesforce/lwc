/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { LightningElement, type LightningElementConstructor } from './lightning-element';
import { mutationTracker } from './mutation-tracker';
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

export type GenerateMarkupFn = (
    tagName: string,
    props: Record<string, any> | null,
    attrs: Attributes | null,
    slotted: Record<number | string, AsyncGenerator<string>> | null
) => AsyncGenerator<string>;

export async function serverSideRenderComponent(
    tagName: string,
    compiledGenerateMarkup: GenerateMarkupFn,
    props: Record<string, any>
): Promise<string> {
    let markup = '';

    for await (const segment of compiledGenerateMarkup(tagName, props, null, null)) {
        markup += segment;
    }

    return markup;
}
