/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { create, forEach, getPropertyDescriptor, isUndefined } from '@lwc/shared';
import { defaultDefHTMLPropertyNames, ElementPrototypeAriaPropertyNames } from './attributes';

// TODO [#0]: Is there a better way to do this? Could we do this lazily after the engine evaluates
// eslint-disable-next-line no-undef
export const HTMLElementCtor = typeof HTMLElement !== 'undefined' ? HTMLElement : function () {};
export const HTMLElementProto = HTMLElementCtor.prototype;

/**
 * This is a descriptor map that contains
 * all standard properties that a Custom Element can support (including AOM properties), which
 * determines what kind of capabilities the Base HTML Element and
 * Base Lightning Element should support.
 */
export const HTMLElementOriginalDescriptors: PropertyDescriptorMap = create(null);

forEach.call(ElementPrototypeAriaPropertyNames, (propName: string) => {
    // Note: intentionally using our in-house getPropertyDescriptor instead of getOwnPropertyDescriptor here because
    // in IE11, some properties are on Element.prototype instead of HTMLElement, just to be sure.
    const descriptor = getPropertyDescriptor(HTMLElementProto, propName);
    if (!isUndefined(descriptor)) {
        HTMLElementOriginalDescriptors[propName] = descriptor;
    }
});
forEach.call(defaultDefHTMLPropertyNames, (propName) => {
    // Note: intentionally using our in-house getPropertyDescriptor instead of getOwnPropertyDescriptor here because
    // in IE11, id property is on Element.prototype instead of HTMLElement, and we suspect that more will fall into
    // this category, so, better to be sure.
    const descriptor = getPropertyDescriptor(HTMLElementProto, propName);
    if (!isUndefined(descriptor)) {
        HTMLElementOriginalDescriptors[propName] = descriptor;
    }
});
