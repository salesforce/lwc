/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {} from '@lwc/shared';
import { lockDomMutation, unlockDomMutation } from '../restrictions';
import type { RendererAPI } from '../renderer';
import type { VComment, VStaticPartText, VText } from '../vnodes';

export function patchTextVNode(n1: VText, n2: VText, renderer: RendererAPI) {
    n2.elm = n1.elm;

    if (n2.text !== n1.text) {
        updateTextContent(n2, renderer);
    }
}

export function patchTextVStaticPart(
    n1: VStaticPartText | null,
    n2: VStaticPartText,
    renderer: RendererAPI
) {
    if (n1 === null || n2.text !== n1.text) {
        updateTextContent(n2, renderer);
    }
}

export function updateTextContent(
    vnode: VText | VComment | VStaticPartText,
    renderer: RendererAPI
) {
    const { elm, text } = vnode;
    const { setText } = renderer;

    if (process.env.NODE_ENV !== 'production') {
        unlockDomMutation();
    }
    setText(elm, text);
    if (process.env.NODE_ENV !== 'production') {
        lockDomMutation();
    }
}
