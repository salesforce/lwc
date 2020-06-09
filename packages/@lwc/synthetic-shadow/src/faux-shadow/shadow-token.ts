/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, defineProperty } from '@lwc/shared';
import { setAttribute, removeAttribute } from '../env/element';

const ShadowTokenKey = '$shadowToken$';
const ShadowTokenPrivateKey = '$$ShadowTokenKey$$';

export function getShadowToken(node: Node): string | undefined {
    return (node as any)[ShadowTokenKey];
}
export function setShadowToken(node: Node, shadowToken: string | undefined) {
    (node as any)[ShadowTokenKey] = shadowToken;
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
defineProperty(Element.prototype, ShadowTokenKey, {
    set(this: Element, shadowToken: string | undefined) {
        const oldShadowToken = (this as any)[ShadowTokenPrivateKey];
        if (!isUndefined(oldShadowToken) && oldShadowToken !== shadowToken) {
            removeAttribute.call(this, oldShadowToken);
        }
        if (!isUndefined(shadowToken)) {
            setAttribute.call(this, shadowToken, '');
        }
        (this as any)[ShadowTokenPrivateKey] = shadowToken;
    },
    get(this: Element): string | undefined {
        return (this as any)[ShadowTokenPrivateKey];
    },
    configurable: true,
});
