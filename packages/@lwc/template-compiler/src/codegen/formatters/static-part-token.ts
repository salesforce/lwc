/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { STATIC_PART_TOKEN_ID, isUndefined, keys } from '@lwc/shared';
import { BaseNode } from '../../shared/types';

export function genStaticPartMetadata(
    node: BaseNode,
    token: STATIC_PART_TOKEN_ID,
    partId: number,
    attrs: string = ''
) {
    if (isUndefined(node.meta)) {
        node.meta = {};
    }
    node.meta.staticParts = { token, partId, attrs };
}

export function extractStaticPartToken(node: BaseNode) {
    let partToken = '';
    const { meta } = node;
    if (!isUndefined(meta) && !isUndefined(meta.staticParts)) {
        const {
            staticParts: { token, partId, attrs },
        } = meta;
        partToken = `${token}${partId}:${attrs}`;
        // Remove the metadata so it doesn't show up in the AST output.
        clearStaticPartMetadata(node);
    }
    return partToken;
}

function clearStaticPartMetadata(node: BaseNode) {
    if (node.meta) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { staticParts, ...rest } = node.meta;
        // Remove metadata object if there's nothing in it.
        node.meta = keys(rest).length ? rest : undefined;
    }
}
