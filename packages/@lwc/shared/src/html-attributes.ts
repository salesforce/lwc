/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

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
