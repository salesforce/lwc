/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const templateRegex = /\{([0-9]+)\}/g;
/**
 * Replaces {0} in the given string with the value from the given array
 * @param template Template string to fill
 * @param args Values to fill with
 * @returns Filled string
 */
export function templateString(template: string, args: any[]) {
    return template.replace(templateRegex, (_, index) => {
        return args[index];
    });
}
