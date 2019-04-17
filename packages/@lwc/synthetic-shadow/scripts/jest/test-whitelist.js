/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
 * List of all tests that are permitted to log a warning or an error.
 *
 * The goal is disallow uninstrumented usage of logging in unit tests. All the tests
 * logging a warning or an error, that are not part of this list will automatically fail.
 *
 * BY ADDING A NEW ENTRY IN THIS LIST, YOU WILL BRING SHAME ON YOURSELF OVER MULTIPLE GENERATIONS!!
 */
const CONSOLE_WHITELIST = [
    '#shadowRootQuerySelector should not throw error if querySelector does not match any elements',
    '#shadowRootQuerySelector should not throw error if querySelectorAll does not match any elements',
    '#shadowRootQuerySelector should return null if querySelector does not match any elements',
    'api #i() should support various types',
    'component public computed props should call setter function when used directly from DOM',
    'component public methods should allow calling getAttribute on child when referenced with querySelector',
    'component public methods should allow calling removeAttribute on child when referenced with querySelector',
    'component public methods should allow calling setAttribute on child when referenced with querySelector',
    'html-element #removeAttribute() should remove attribute on host element when element is nested in template',
    'html-element global HTML Properties should correctly set child attribute',
    'html-element global HTML Properties should log console error when user land code changes attribute via querySelector',
    'html-element global HTML Properties should log console error when user land code removes attribute via querySelector',
    'html-element global HTML Properties should log error message when attribute is set via elm.setAttribute if reflective property is defined',
    'html-element life-cycles should not throw error when accessing a non-observable property from tracked property when not rendering',
];

for (let i = 0; i < CONSOLE_WHITELIST.length; i++) {
    for (let j = i + 1; j < CONSOLE_WHITELIST.length; j++) {
        if (CONSOLE_WHITELIST[i] === CONSOLE_WHITELIST[j]) {
            throw new Error(`Duplicate test name in whitelist "${CONSOLE_WHITELIST[i]}"`);
        }
    }
}

module.exports = {
    CONSOLE_WHITELIST,
};
