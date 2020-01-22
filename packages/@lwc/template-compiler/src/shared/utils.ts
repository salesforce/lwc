/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export function toCamelCase(attr: string) {
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
