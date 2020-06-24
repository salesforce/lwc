/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { AriaAttrNameToPropNameMap, AriaPropNameToAttrNameMap } from './aria';

const BOOLEAN_ATTRIBUTES = new Set([
    'autofocus', // <button>, <input>, <keygen>, <select>, <textarea>
    'autoplay', // <audio>, <video>
    'capture', // <input type='file'>
    'checked', // <command>, <input>
    'disabled', // <button>, <command>, <fieldset>, <input>, <keygen>, <optgroup>, <option>, <select>, <textarea>
    'formnovalidate', // submit button
    'hidden', // Global attribute
    'loop', // <audio>, <bgsound>, <marquee>, <video>
    'multiple', // <input>, <select>
    'muted', // <audio>, <video>
    'novalidate', // <form>
    'open', // <details>
    'readonly', // <input>, <textarea>
    'required', // <input>, <select>, <textarea>
    'reversed', // <ol>
    'selected', // <option>
]);

export function isBooleanAttribute(attrName: string): boolean {
    return BOOLEAN_ATTRIBUTES.has(attrName);
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

const HTML_ATTRIBUTES_TO_PROPERTY = new Map([
    ['accesskey', 'accessKey'],
    ['readonly', 'readOnly'],
    ['tabindex', 'tabIndex'],
    ['bgcolor', 'bgColor'],
    ['colspan', 'colSpan'],
    ['rowspan', 'rowSpan'],
    ['contenteditable', 'contentEditable'],
    ['crossorigin', 'crossOrigin'],
    ['datetime', 'dateTime'],
    ['formaction', 'formAction'],
    ['ismap', 'isMap'],
    ['maxlength', 'maxLength'],
    ['minlength', 'minLength'],
    ['novalidate', 'noValidate'],
    ['usemap', 'useMap'],
    ['for', 'htmlFor'],
]);
const HTML_PROPERTIES_TO_ATTRIBUTE = new Map(
    [...HTML_ATTRIBUTES_TO_PROPERTY.entries()].map(([k, v]) => [v, k])
);

export function htmlAttributeToProperty(attrName: string): string {
    if (attrName in AriaAttrNameToPropNameMap) {
        return AriaAttrNameToPropNameMap[attrName];
    }

    if (HTML_ATTRIBUTES_TO_PROPERTY.has(attrName)) {
        return HTML_ATTRIBUTES_TO_PROPERTY.get(attrName)!;
    }

    return attrName;
}
export function htmlPropertyToAttribute(propName: string): string {
    if (propName in AriaPropNameToAttrNameMap) {
        return AriaPropNameToAttrNameMap[propName];
    }

    if (HTML_PROPERTIES_TO_ATTRIBUTE.has(propName)) {
        return HTML_PROPERTIES_TO_ATTRIBUTE.get(propName)!;
    }

    return propName;
}
