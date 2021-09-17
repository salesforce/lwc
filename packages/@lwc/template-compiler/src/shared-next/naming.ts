/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export function kebabcaseToCamelcase(name: string): string {
    const newName: string[] = [];
    let nsFound = false;
    let upper = false;
    for (let i = 0; i < name.length; i++) {
        if (name[i] === '-') {
            if (!nsFound) {
                nsFound = true;
                newName.push('/');
            } else {
                upper = true;
            }
        } else {
            newName.push(upper ? name[i].toUpperCase() : name[i]);
            upper = false;
        }
    }
    return newName.join('');
}
