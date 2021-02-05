/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isNull } from '@lwc/shared';

let NativeShadowRoot: any = null;
if (typeof ShadowRoot !== 'undefined') {
    NativeShadowRoot = ShadowRoot;
}

export function isInstanceOfNativeShadowRoot(node: any): boolean {
    if (isNull(NativeShadowRoot)) {
        return false;
    }
    return node instanceof NativeShadowRoot;
}
