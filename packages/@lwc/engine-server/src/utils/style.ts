/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// TODO [#0]: This is a straight copy of the style helper from the template compiler. Is there a
// better way to avoid this? Can we avoid manipulating styles directly?

type StyleDeclaration = Record<string, string>;

const DASH_CHAR_CODE = 45; // "-"

const DECLARATION_DELIMITER = /;(?![^(]*\))/g;
const PROPERTY_DELIMITER = /:(.+)/;

// Implementation of the CSS property to IDL attribute algorithm.
// https://drafts.csswg.org/cssom/#idl-attribute-to-css-property
function cssPropertyToIdlAttribute(property: string): string {
    let output = '';
    let uppercaseNext = false;

    for (let i = 0; i < property.length; i++) {
        if (property.charCodeAt(i) === DASH_CHAR_CODE) {
            uppercaseNext = true;
        } else if (uppercaseNext) {
            uppercaseNext = false;
            output += property[i].toUpperCase();
        } else {
            output += property[i];
        }
    }

    return output;
}

function idlAttributeToCssProperty(attribute: string): string {
    let output = '';

    for (let i = 0; i < attribute.length; i++) {
        const char = attribute.charAt(i);
        const lowerCasedChar = char.toLowerCase();

        if (char !== lowerCasedChar) {
            output += `-${lowerCasedChar}`;
        } else {
            output += `${char}`;
        }
    }

    return output;
}

// Borrowed from Vue template compiler.
// https://github.com/vuejs/vue/blob/531371b818b0e31a989a06df43789728f23dc4e8/src/platforms/web/util/style.js#L5-L16
export function styleTextToCssDeclaration(cssText: string): StyleDeclaration {
    const styleDeclaration: StyleDeclaration = {};

    const declarations = cssText.split(DECLARATION_DELIMITER);
    for (const declaration of declarations) {
        if (declaration) {
            const [prop, value] = declaration.split(PROPERTY_DELIMITER);

            if (prop !== undefined && value !== undefined) {
                const camelCasedAttribute = cssPropertyToIdlAttribute(prop.trim());
                styleDeclaration[camelCasedAttribute] = value.trim();
            }
        }
    }

    return styleDeclaration;
}

export function cssDeclarationToStyleText(styleDeclaration: StyleDeclaration): string {
    return Object.entries(styleDeclaration)
        .map(([prop, value]) => {
            return `${idlAttributeToCssProperty(prop)}: ${value};`;
        })
        .join(' ');
}
