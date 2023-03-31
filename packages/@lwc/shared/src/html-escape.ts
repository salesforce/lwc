/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const ESCAPED_CHARS: { [char: string]: string } = {
    '"': '&quot;',
    "'": '&#x27;',
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
};

export function htmlEscape(str: string, attrMode: boolean = false): string {
    const searchValue = attrMode ? /["&]/g : /["'<>&]/g;

    return str.replace(searchValue, (char) => ESCAPED_CHARS[char]);
}
