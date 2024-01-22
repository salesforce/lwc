/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DASHED_TAGNAME_ELEMENT_SET } from './constants';

export function toPropertyName(attr: string) {
    let prop = '';
    let shouldUpperCaseNext = false;

    for (let i = 0; i < attr.length; i++) {
        const char = attr.charAt(i);

        if (char === '-') {
            shouldUpperCaseNext = true;
        } else {
            prop += shouldUpperCaseNext ? char.toUpperCase() : char;
            shouldUpperCaseNext = false;
        }
    }

    return prop;
}

/**
 * Test if given tag name is a custom element.
 * @param tagName element tag name to test
 * @returns true if given tag name represents a custom element, false otherwise.
 */
export function isCustomElementTag(tagName: string): boolean {
    return tagName.includes('-') && !DASHED_TAGNAME_ELEMENT_SET.has(tagName);
}

/**
 * Test if given tag name is a custom LWC tag denoted lwc:*.
 * @param tagName element tag name to test
 * @returns true if given tag name represents a custom LWC tag, false otherwise.
 */
export function isLwcElementTag(tagName: string): boolean {
    return tagName.startsWith('lwc:');
}
