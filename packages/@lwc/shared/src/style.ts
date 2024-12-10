/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { isArray } from './language';
import type { KEY__NATIVE_ONLY_CSS, KEY__SCOPED_CSS } from './keys';

export const IMPORTANT_FLAG = /\s*!\s*important\s*$/i;
const DECLARATION_DELIMITER = /;(?![^(]*\))/g;
const PROPERTY_DELIMITER = /:(.+)/s; // `/s` (dotAll) required to match styles across newlines, e.g. `color: \n red;`

/**
 * Function producing style based on a host and a shadow selector. This function is invoked by
 * the engine with different values depending on the mode that the component is running on.
 */
export type Stylesheet = {
    /**
     * Function taking a stylesheet token (string), whether to render actual or "scoped" `:host()` pseudo-classes,
     * and whether to render actual or synthetic `:dir()` pseudo-classes and returning a CSS string.
     * This function signature should _not_ be considered a stable API surface - it is internal to the LWC engine.
     */
    (
        stylesheetToken: string | undefined,
        useActualHostSelector: boolean,
        useNativeDirPseudoclass: boolean
    ): string;
    /**
     * True if this is a scoped style (e.g. `foo.scoped.css`)
     */
    [KEY__SCOPED_CSS]?: boolean;
    /**
     * True if this is a native-only style (i.e. compiled with `disableSyntheticShadowSupport`).
     */
    [KEY__NATIVE_ONLY_CSS]?: boolean;
};

/**
 * The list of stylesheets associated with a template. Each entry is either a `Stylesheet` or
 * an array of stylesheets that a given stylesheet depends on via CSS `@import` declarations.
 */
export type Stylesheets = Array<Stylesheet | Stylesheets>;

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

export function normalizeStyleAttributeValue(style: string): string {
    const styleMap = parseStyleText(style);

    const styles = Object.entries(styleMap).map(([key, value]) => {
        value = value.replace(IMPORTANT_FLAG, ' !important').trim();
        return `${key}: ${value};`;
    });

    return styles.join(' ');
}

export function flattenStylesheets(stylesheets: Stylesheets): Stylesheet[] {
    const list: Stylesheet[] = [];
    for (const stylesheet of stylesheets) {
        if (!isArray(stylesheet)) {
            list.push(stylesheet);
        } else {
            list.push(...flattenStylesheets(stylesheet));
        }
    }
    return list;
}
