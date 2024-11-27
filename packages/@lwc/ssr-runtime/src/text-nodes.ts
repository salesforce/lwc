/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { htmlEscape } from '@lwc/shared';

// Zero Width Joiner character. Special character used by SSR/hydration as
// a placeholder for empty text nodes.
const ZWJ = '\u200D';

let buffer = '';
let active = false;

// Buffer a new string of text node content to be rendered concatenated together
export function enqueueTextContent(value: string) {
    // Using non strict equality to align with original implementation (ex. undefined == null)
    // See: https://github.com/salesforce/lwc/blob/348130f/packages/%40lwc/engine-core/src/framework/api.ts#L548
    buffer += value == null ? '' : String(value);
    active = true;
}

// We are at the end of a series of text nodes - flush to a concatenated string
export function flushTextContent() {
    // We only render the ZWJ if there were actually any dynamic text nodes rendered
    // The ZWJ is just so hydration can compare the SSR'd dynamic text content against
    // the CSR'd text content.
    const result = active && buffer === '' ? ZWJ : htmlEscape(buffer);
    buffer = '';
    active = false;
    return result;
}
