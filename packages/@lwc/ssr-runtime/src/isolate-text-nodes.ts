/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
let buffer = '';

export function enqueueTextContent(str: string) {
    buffer += str;
}

export function flushTextContent() {
    const result = buffer === '' ? '\u200D' : buffer;
    buffer = '';
    return result;
}
