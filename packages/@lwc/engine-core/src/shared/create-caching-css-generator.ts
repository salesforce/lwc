/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { StylesheetFactory, StylesheetFactoryResult } from './stylesheet-factory';

/**
 * Given a StylesheetFactory, return another StylesheetFactory that properly caches the
 * CSSStyleSheet object if the browser supports adopted style sheets and we're in native
 * shadow DOM.
 *
 * The reason we do this here is because the input `generateCss` function is generated,
 * and will vary from component to component. But we want to define the CSSStyleSheet only
 * once per component, and the best place to do that is in the component itself (to avoid
 * needing to keep a Map of strings to CSSStyleSheets). But to avoid duplicating this code
 * over and over in every component, we extract it into its own shared function.
 * @param generateCss
 */
export function createCachingCssGenerator(generateCss: StylesheetFactory): StylesheetFactory {
    let cachedStylesheet: CSSStyleSheet;

    return function generateCssWithCaching(
        hostSelector: string,
        shadowSelector: string,
        nativeShadow: boolean,
        hasAdoptedStyleSheets: boolean
    ): StylesheetFactoryResult {
        if (nativeShadow && hasAdoptedStyleSheets) {
            if (!cachedStylesheet) {
                cachedStylesheet = new CSSStyleSheet();
                // adoptedStyleSheets not in TypeScript yet: https://github.com/microsoft/TypeScript/issues/30022
                // @ts-ignore
                cachedStylesheet.replaceSync(
                    generateCss(hostSelector, shadowSelector, nativeShadow, hasAdoptedStyleSheets)
                );
            }
            return cachedStylesheet; // fast path
        }
        return generateCss(hostSelector, shadowSelector, nativeShadow, hasAdoptedStyleSheets);
    };
}
