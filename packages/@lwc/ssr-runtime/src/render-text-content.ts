/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { htmlEscape } from '@lwc/shared';

/**
 * Given an object, render it for use as a text content node. Not that this applies to individual text nodes,
 * not the concatenated result of multiple adjacent text nodes.
 * @param value
 */
export function normalizeTextContent(value: unknown): string {
    // Using non strict equality to align with original implementation (ex. undefined == null)
    // See: https://github.com/salesforce/lwc/blob/348130f/packages/%40lwc/engine-core/src/framework/api.ts#L548
    return value == null ? '' : String(value);
}

/**
 * Given a string, render it for use as text content in HTML. Notably this escapes HTML and renders as
 * a ZWJ is empty. Intended to be used on the result of concatenating multiple adjacent text nodes together.
 * @param value
 */
export function renderTextContent(value: string): string {
    // We are at the end of a series of text nodes - flush to a concatenated string
    // We only render the ZWJ if there were actually any dynamic text nodes rendered
    // The ZWJ is just so hydration can compare the SSR'd dynamic text content against
    // the CSR'd text content.
    return value === '' ? '\u200D' : htmlEscape(value);
}
