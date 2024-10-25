/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DASHED_TAGNAME_ELEMENT_SET } from './constants';

// Originally defined here, so this re-export is just for backwards compatibility
export { toPropertyName } from '@lwc/shared';

/**
 * Test if given tag name is a custom element.
 * @param tagName element tag name to test
 * @returns true if given tag name represents a custom element, false otherwise.
 * @example isCustomElementTag("my-component") // true
 */
export function isCustomElementTag(tagName: string): boolean {
    return tagName.includes('-') && !DASHED_TAGNAME_ELEMENT_SET.has(tagName);
}

/**
 * Test if given tag name is a custom LWC tag denoted lwc:*.
 * @param tagName element tag name to test
 * @returns true if given tag name represents a custom LWC tag, false otherwise.
 * @example isLwcElementTag("my-component") // false
 */
export function isLwcElementTag(tagName: string): boolean {
    return tagName.startsWith('lwc:');
}
