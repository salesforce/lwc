/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { AriaPropNameToAttrNameMap } from './aria';
import { isUndefined, StringCharCodeAt, StringFromCharCode, StringReplace } from './language';

const CAMEL_REGEX = /-([a-z])/g;

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

// This list is based on https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
const GLOBAL_ATTRIBUTE = new Set([
    'accesskey',
    'autocapitalize',
    'autofocus',
    'class',
    'contenteditable',
    'contextmenu',
    'dir',
    'draggable',
    'enterkeyhint',
    'exportparts',
    'hidden',
    'id',
    'inputmode',
    'is',
    'itemid',
    'itemprop',
    'itemref',
    'itemscope',
    'itemtype',
    'lang',
    'nonce',
    'part',
    'slot',
    'spellcheck',
    'style',
    'tabindex',
    'title',
    'translate',
]);

export function isGlobalHtmlAttribute(attrName: string): boolean {
    return GLOBAL_ATTRIBUTE.has(attrName);
}

// These are HTML standard prop/attribute IDL mappings, but are not predictable based on camel/kebab-case conversion
const SPECIAL_PROPERTY_ATTRIBUTE_MAPPING = new Map([
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

    const specialAttributeName = SPECIAL_PROPERTY_ATTRIBUTE_MAPPING.get(propName);
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

/**
 * Map associating previously transformed kabab-case attributes into camel-case props.
 */
const CACHED_KEBAB_CAMEL_MAPPING = new Map<string, string>();

export function kebabCaseToCamelCase(attrName: string): string {
    let result = CACHED_KEBAB_CAMEL_MAPPING.get(attrName);

    if (isUndefined(result)) {
        result = StringReplace.call(attrName, CAMEL_REGEX, (g) => g[1].toUpperCase());
    }

    return result;
}
