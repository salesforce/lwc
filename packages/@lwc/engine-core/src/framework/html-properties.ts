/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    create,
    forEach,
    getOwnPropertyDescriptor,
    isUndefined,
    keys,
    AriaPropNameToAttrNameMap,
} from '@lwc/shared';

const defaultDefElementPropertyNames = ['id'];

const defaultDefHTMLElementPropertyNames = [
    'accessKey',
    'dir',
    'draggable',
    'hidden',
    'id',
    'lang',
    'spellcheck',
    'tabIndex',
    'title',
];

/**
 * This is a descriptor map that contains
 * all standard properties that a Custom Element can support (including AOM properties), which
 * determines what kind of capabilities the Base HTML Element and
 * Base Lightning Element should support.
 */
export const HTMLElementOriginalDescriptors: PropertyDescriptorMap = create(null);

// These properties are on Element.prototype
if (typeof Element === 'function') {
    forEach.call(
        [...keys(AriaPropNameToAttrNameMap), ...defaultDefElementPropertyNames],
        (propName: string) => {
            const descriptor = getOwnPropertyDescriptor(Element.prototype, propName);
            if (!isUndefined(descriptor)) {
                HTMLElementOriginalDescriptors[propName] = descriptor;
            }
        }
    );
}

// These properties are on HTMLElement.prototype
if (typeof HTMLElement === 'function') {
    forEach.call(defaultDefHTMLElementPropertyNames, (propName) => {
        const descriptor = getOwnPropertyDescriptor(HTMLElement.prototype, propName);
        if (!isUndefined(descriptor)) {
            HTMLElementOriginalDescriptors[propName] = descriptor;
        }
    });
}
