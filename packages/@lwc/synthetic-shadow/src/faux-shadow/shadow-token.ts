/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    defineProperty,
    isUndefined,
    KEY__SHADOW_TOKEN,
    KEY__SHADOW_TOKEN_PRIVATE,
} from '@lwc/shared';

import { setAttribute, removeAttribute } from '../env/element';
import { Element } from '../env/global';

export function getShadowToken(node: Node): string | undefined {
    return (node as any)[KEY__SHADOW_TOKEN];
}
export function setShadowToken(node: Node, shadowToken: string | undefined) {
    (node as any)[KEY__SHADOW_TOKEN] = shadowToken;
}

/**
 * Patching Element.prototype.$shadowToken$ to mark elements a portal:
 *
 *  - we use a property to allow engines to set a custom attribute that should be
 *    placed into the element to sandbox the css rules defined for the template.
 *
 *  - this custom attribute must be unique.
 *
 **/
defineProperty(Element.prototype, KEY__SHADOW_TOKEN, {
    set(this: Element, shadowToken: string | undefined) {
        const oldShadowToken = (this as any)[KEY__SHADOW_TOKEN_PRIVATE];
        if (!isUndefined(oldShadowToken) && oldShadowToken !== shadowToken) {
            removeAttribute.call(this, oldShadowToken);
        }
        if (!isUndefined(shadowToken)) {
            setAttribute.call(this, shadowToken, '');
        }
        (this as any)[KEY__SHADOW_TOKEN_PRIVATE] = shadowToken;
    },
    get(this: Element): string | undefined {
        return (this as any)[KEY__SHADOW_TOKEN_PRIVATE];
    },
    configurable: true,
});
