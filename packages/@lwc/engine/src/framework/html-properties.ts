/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    create,
    forEach,
    getPropertyDescriptor,
    isUndefined,
    keys,
    AriaPropNameToAttrNameMap,
} from '@lwc/shared';
import { defaultDefHTMLPropertyNames } from './attributes';

/**
 * This is a descriptor map that contains
 * all standard properties that a Custom Element can support (including AOM properties), which
 * determines what kind of capabilities the Base HTML Element and
 * Base Lightning Element should support.
 */
export const HTMLElementOriginalDescriptors: PropertyDescriptorMap = create(null);

forEach.call(keys(AriaPropNameToAttrNameMap), (propName: string) => {
    // Note: intentionally using our in-house getPropertyDescriptor instead of getOwnPropertyDescriptor here because
    // in IE11, some properties are on Element.prototype instead of HTMLElement, just to be sure.
    const descriptor = getPropertyDescriptor(HTMLElement.prototype, propName);
    if (!isUndefined(descriptor)) {
        HTMLElementOriginalDescriptors[propName] = descriptor;
    }
});
forEach.call(defaultDefHTMLPropertyNames, (propName) => {
    // Note: intentionally using our in-house getPropertyDescriptor instead of getOwnPropertyDescriptor here because
    // in IE11, id property is on Element.prototype instead of HTMLElement, and we suspect that more will fall into
    // this category, so, better to be sure.
    const descriptor = getPropertyDescriptor(HTMLElement.prototype, propName);
    if (!isUndefined(descriptor)) {
        HTMLElementOriginalDescriptors[propName] = descriptor;
    }
});
