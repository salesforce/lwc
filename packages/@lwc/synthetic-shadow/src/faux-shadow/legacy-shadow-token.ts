/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// TODO [#3733]: remove this entire file when we can remove legacy scope tokens
import {
    defineProperty,
    isUndefined,
    KEY__LEGACY_SHADOW_TOKEN,
    KEY__LEGACY_SHADOW_TOKEN_PRIVATE,
} from '@lwc/shared';
import { setAttribute, removeAttribute } from '../env/element';

export function getLegacyShadowToken(node: Node): string | undefined {
    return (node as any)[KEY__LEGACY_SHADOW_TOKEN];
}
export function setLegacyShadowToken(node: Node, shadowToken: string | undefined) {
    (node as any)[KEY__LEGACY_SHADOW_TOKEN] = shadowToken;
}

/**
 * Patching Element.prototype.$legacyShadowToken$ to mark elements a portal:
 * Same as $shadowToken$ but for legacy CSS scope tokens.
 **/
defineProperty(Element.prototype, KEY__LEGACY_SHADOW_TOKEN, {
    set(this: Element, shadowToken: string | undefined) {
        const oldShadowToken = (this as any)[KEY__LEGACY_SHADOW_TOKEN_PRIVATE];
        if (!isUndefined(oldShadowToken) && oldShadowToken !== shadowToken) {
            removeAttribute.call(this, oldShadowToken);
        }
        if (!isUndefined(shadowToken)) {
            setAttribute.call(this, shadowToken, '');
        }
        (this as any)[KEY__LEGACY_SHADOW_TOKEN_PRIVATE] = shadowToken;
    },
    get(this: Element): string | undefined {
        return (this as any)[KEY__LEGACY_SHADOW_TOKEN_PRIVATE];
    },
    configurable: true,
});
