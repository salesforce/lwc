/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    AriaPropNameToAttrNameMap,
    create,
    getPropertyDescriptor,
    keys,
    REFLECTIVE_GLOBAL_PROPERTY_SET,
} from '@lwc/shared';

import { HTMLElementPrototype } from './html-element';

/**
 * This is a descriptor map that contains
 * all standard properties that a Custom Element can support (including AOM properties), which
 * determines what kind of capabilities the Base HTML Element and
 * Base Lightning Element should support.
 */
export const HTMLElementOriginalDescriptors: PropertyDescriptorMap = create(null);

keys(AriaPropNameToAttrNameMap).forEach((propName) => {
    const descriptor = getPropertyDescriptor(HTMLElementPrototype, propName);
    if (descriptor !== undefined) {
        HTMLElementOriginalDescriptors[propName] = descriptor;
    }
});

for (const propName of REFLECTIVE_GLOBAL_PROPERTY_SET) {
    // Note: intentionally using our in-house getPropertyDescriptor instead of getOwnPropertyDescriptor here because
    // in IE11, id property is on Element.prototype instead of HTMLElement, and we suspect that more will fall into
    // this category, so, better to be sure.
    const descriptor = getPropertyDescriptor(HTMLElementPrototype, propName);
    if (descriptor !== undefined) {
        HTMLElementOriginalDescriptors[propName] = descriptor;
    }
}
