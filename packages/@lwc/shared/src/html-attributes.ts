/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { AriaPropNameToAttrNameMap } from './aria';
import { isUndefined, StringCharCodeAt, StringFromCharCode } from './language';

/**
 * Maps boolean attribute name to supported tags: 'boolean attr name' => Set of allowed tag names
 * that supports them.
 */
const BOOLEAN_ATTRIBUTES = new Map([
    ['autofocus', new Set(['button', 'input', 'keygen', 'select', 'textarea'])],
    ['autoplay', new Set(['audio', 'video'])],
    ['checked', new Set(['command', 'input'])],
    [
        'disabled',
        new Set([
            'button',
            'command',
            'fieldset',
            'input',
            'keygen',
            'optgroup',
            'select',
            'textarea',
        ]),
    ],
    ['formnovalidate', new Set(['button'])], // button[type=submit]
    ['hidden', new Set()], // Global attribute
    ['loop', new Set(['audio', 'bgsound', 'marquee', 'video'])],
    ['multiple', new Set(['input', 'select'])],
    ['muted', new Set(['audio', 'video'])],
    ['novalidate', new Set(['form'])],
    ['open', new Set(['details'])],
    ['readonly', new Set(['input', 'textarea'])],
    ['required', new Set(['input', 'select', 'textarea'])],
    ['reversed', new Set(['ol'])],
    ['selected', new Set(['option'])],
]);

export function isBooleanAttribute(attrName: string, tagName: string): boolean {
    const allowedTagNames = BOOLEAN_ATTRIBUTES.get(attrName);
    return (
        allowedTagNames !== undefined &&
        (allowedTagNames.size === 0 || allowedTagNames.has(tagName))
    );
}

const GLOBAL_ATTRIBUTE = new Set([
    'role',
    'accesskey',
    'class',
    'contenteditable',
    'contextmenu',
    'dir',
    'draggable',
    'dropzone',
    'hidden',
    'id',
    'itemprop',
    'lang',
    'slot',
    'spellcheck',
    'style',
    'tabindex',
    'title',
]);

export function isGlobalHtmlAttribute(attrName: string): boolean {
    return GLOBAL_ATTRIBUTE.has(attrName);
}

/**
 * Map composed of properties to attributes not following the HTML property to attribute mapping
 * convention.
 */
const NO_STANDARD_PROPERTY_ATTRIBUTE_MAPPING = new Map([
    ['accessKey', 'accesskey'],
    ['readOnly', 'readonly'],
    ['tabIndex', 'tabindex'],
    ['bgColor', 'bgcolor'],
    ['colSpan', 'colspan'],
    ['rowSpan', 'rowspan'],
    ['contentEditable', 'contenteditable'],
    ['crossOrigin', 'crossorigin'],
    ['dateTime', 'datetime'],
    ['formAction', 'formaction'],
    ['isMap', 'ismap'],
    ['maxLength', 'maxlength'],
    ['minLength', 'minlength'],
    ['noValidate', 'novalidate'],
    ['useMap', 'usemap'],
    ['htmlFor', 'for'],
]);

/**
 * Map associating previously transformed HTML property into HTML attribute.
 */
const CACHED_PROPERTY_ATTRIBUTE_MAPPING = new Map<string, string>();

export function htmlPropertyToAttribute(propName: string): string {
    const ariaAttributeName = AriaPropNameToAttrNameMap[propName];
    if (!isUndefined(ariaAttributeName)) {
        return ariaAttributeName;
    }

    const specialAttributeName = NO_STANDARD_PROPERTY_ATTRIBUTE_MAPPING.get(propName);
    if (!isUndefined(specialAttributeName)) {
        return specialAttributeName;
    }

    const cachedAttributeName = CACHED_PROPERTY_ATTRIBUTE_MAPPING.get(propName);
    if (!isUndefined(cachedAttributeName)) {
        return cachedAttributeName;
    }

    let attributeName = '';
    for (let i = 0, len = propName.length; i < len; i++) {
        const code = StringCharCodeAt.call(propName, i);
        if (
            code >= 65 && // "A"
            code <= 90 // "Z"
        ) {
            attributeName += '-' + StringFromCharCode(code + 32);
        } else {
            attributeName += StringFromCharCode(code);
        }
    }

    CACHED_PROPERTY_ATTRIBUTE_MAPPING.set(propName, attributeName);
    return attributeName;
}
