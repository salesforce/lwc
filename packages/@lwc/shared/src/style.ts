/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export const IMPORTANT_FLAG = /\s*!\s*important\s*$/i;
const DECLARATION_DELIMITER = /;(?![^(]*\))/g;
const PROPERTY_DELIMITER = /:(.+)/s; // `/s` (dotAll) required to match styles across newlines, e.g. `color: \n red;`

// Borrowed from Vue template compiler.
// https://github.com/vuejs/vue/blob/531371b818b0e31a989a06df43789728f23dc4e8/src/platforms/web/util/style.js#L5-L16
export function parseStyleText(cssText: string): { [name: string]: string } {
    const styleMap: { [name: string]: string } = {};

    const declarations = cssText.split(DECLARATION_DELIMITER);
    for (const declaration of declarations) {
        if (declaration) {
            const [prop, value] = declaration.split(PROPERTY_DELIMITER);

            if (prop !== undefined && value !== undefined) {
                styleMap[prop.trim()] = value.trim();
            }
        }
    }

    return styleMap;
}

export function normalizeStyleAttribute(style: string): string {
    const styleMap = parseStyleText(style);

    const styles = Object.entries(styleMap).map(([key, value]) => {
        value = value.replace(IMPORTANT_FLAG, ' !important').trim();
        return `${key}: ${value};`;
    });

    return styles.join(' ');
}
