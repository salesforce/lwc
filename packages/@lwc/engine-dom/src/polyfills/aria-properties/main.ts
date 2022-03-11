/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { AriaPropNameToAttrNameMap, keys } from '@lwc/shared';
import { detect } from './detect';
import { patch } from './polyfill';

const ElementPrototypeAriaPropertyNames = keys(AriaPropNameToAttrNameMap);

for (let i = 0, len = ElementPrototypeAriaPropertyNames.length; i < len; i += 1) {
    const propName = ElementPrototypeAriaPropertyNames[i];
    if (detect(propName)) {
        patch(propName);
    }
}
