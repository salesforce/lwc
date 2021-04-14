/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export type StylesheetFactoryResult = string | CSSStyleSheet;

/**
 * Function producing style based on a host and a shadow selector. This function is invoked by
 * the engine with different values depending on the mode that the component is running on.
 * If adopted style sheets are supported, then a CSSStyleSheet is returned. Otherwise, a string.
 */
export type StylesheetFactory = (
    hostSelector: string,
    shadowSelector: string,
    nativeShadow: boolean,
    hasAdoptedStyleSheets: boolean
) => StylesheetFactoryResult;
