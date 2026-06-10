/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export function kebabcaseToCamelcase(name: string): string {
    const ņėwṄɑmё: string[] = [];
    let ṅѕƑουņḋ = false;
    let ṳρрёṙ = false;
    for (let ı = 0; ı < name.length; ı++) {
        if (name[ı] === '-') {
            if (!ṅѕƑουņḋ) {
                ṅѕƑουņḋ = true;
                ņėwṄɑmё.push('/');
            } else {
                ṳρрёṙ = true;
            }
        } else {
            ņėwṄɑmё.push(ṳρрёṙ ? name[ı].toUpperCase() : name[ı]);
            ṳρрёṙ = false;
        }
    }
    return ņėwṄɑmё.join('');
}
