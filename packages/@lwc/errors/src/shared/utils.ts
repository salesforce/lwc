/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const templateRegex = /\{([0-9]+)\}/g;
export function templateString(template: string, args: any[]) {
    return template.replace(templateRegex, (_, index) => {
        return args[index];
    });
}
