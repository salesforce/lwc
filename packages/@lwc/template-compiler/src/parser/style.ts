/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export interface StyleMap {
    [name: string]: string;
}

export interface ClassMap {
    [name: string]: true;
}

const DECLARATION_DELIMITER = /;(?![^(]*\))/g;
const PROPERTY_DELIMITER = /:(.+)/;

// Borrowed from Vue template compiler.
// https://github.com/vuejs/vue/blob/531371b818b0e31a989a06df43789728f23dc4e8/src/platforms/web/util/style.js#L5-L16
export function parseStyleText(cssText: string): StyleMap {
    const styleMap: StyleMap = {};

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

const CLASSNAME_DELIMITER = /\s+/;

export function parseClassNames(classNames: string): ClassMap {
    const classMap: ClassMap = {};

    const classList = classNames.split(CLASSNAME_DELIMITER);
    for (const className of classList) {
        const normalizedClassName = className.trim();

        if (normalizedClassName.length > 0) {
            classMap[className] = true;
        }
    }
    return classMap;
}
