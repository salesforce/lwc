/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { isNumber } from './language';

export const enum APIVersion {
    V58_244_SUMMER_23 = 58,
    V59_246_WINTER_24 = 59,
    V60_248_SPRING_24 = 60,
    V61_250_SUMMER_24 = 61,
    V62_252_WINTER_25 = 62,
    V63_254_SPRING_25 = 63,
}

// These must be updated when the enum is updated.
// It's a bit annoying to do have to do this manually, but this makes the file tree-shakeable,
// passing the `verify-treeshakeable.js` test.

const allVersions = [
    APIVersion.V58_244_SUMMER_23,
    APIVersion.V59_246_WINTER_24,
    APIVersion.V60_248_SPRING_24,
    APIVersion.V61_250_SUMMER_24,
    APIVersion.V62_252_WINTER_25,
    APIVersion.V63_254_SPRING_25,
];
const allVersionsSet = /*@__PURE__@*/ new Set(allVersions);
export const LOWEST_API_VERSION = allVersions[0];
export const HIGHEST_API_VERSION = allVersions[allVersions.length - 1];

/**
 *
 * @param version
 */
export function getAPIVersionFromNumber(version: number | undefined): APIVersion {
    if (!isNumber(version)) {
        // if version is unspecified, default to latest
        return HIGHEST_API_VERSION;
    }
    if (allVersionsSet.has(version)) {
        return version;
    }
    if (version < LOWEST_API_VERSION) {
        return LOWEST_API_VERSION;
    }
    // If it's a number, and it's within the bounds of our known versions, then we should find the
    // highest version lower than the requested number.
    // For instance, if we know about versions 1, 2, 5, and 6, and the user requests 3, then we should return 2.
    for (let i = 1; i < allVersions.length; i++) {
        if (allVersions[i] > version) {
            return allVersions[i - 1];
        }
    }
    // version > HIGHEST_API_VERSION, so fall back to highest
    return HIGHEST_API_VERSION;
}

export const enum APIFeature {
    /**
     * Lowercase all scope tokens, enable the SVG static optimization
     */
    LOWERCASE_SCOPE_TOKENS,
    /**
     * If enabled, all parse5 errors will result in a compile-time error, rather than some being treated as warnings
     * (for backwards compatibility).
     */
    TREAT_ALL_PARSE5_ERRORS_AS_ERRORS,
    /**
     * If enabled, use fragments for slots in light DOM.
     */
    USE_FRAGMENTS_FOR_LIGHT_DOM_SLOTS,
    /**
     * If enabled, Babel object rest spread polyfills are not applied, and the native format is used instead.
     */
    DISABLE_OBJECT_REST_SPREAD_TRANSFORMATION,
    /**
     * If enabled, `registerDecorators()` calls will only be added to classes that extend from another class.
     * This avoids unnecessary decorators on classes that cannot possibly be LightningElements.
     */
    SKIP_UNNECESSARY_REGISTER_DECORATORS,
    /**
     * If enabled, comment nodes will be added to the beginning and end of each VFragment node, used
     * as anchors/bookends for efficient DOM operations. If disabled, empty text nodes will be used
     * instead of comment nodes.
     */
    USE_COMMENTS_FOR_FRAGMENT_BOOKENDS,
    /**
     * If enabled, allows slot forwarding for light DOM slots. This will cause the slot attribute of the slotted
     * content to be updated to match the slot attribute of the light DOM slot it slotted into.
     */
    USE_LIGHT_DOM_SLOT_FORWARDING,
    /**
     * If enabled, allows usage of the `attachInternals` and `ElementInternals` APIs, as well as
     * Form-Associated Custom Elements (FACE).
     */
    ENABLE_ELEMENT_INTERNALS_AND_FACE,
    /**
     * If enabled, allow `this.hostElement` within a `LightningElement` to return the host element.
     */
    ENABLE_THIS_DOT_HOST_ELEMENT,
    /**
     * If enabled, allow `this.style` within a `LightningElement` to return the `CSSStyleDeclaration`
     * for that element.
     */
    ENABLE_THIS_DOT_STYLE,
    /**
     * If enabled, add support for complex class expressions in the template.
     */
    TEMPLATE_CLASS_NAME_OBJECT_BINDING,
    /**
     * If enabled, add support for complex template expressions.
     */
    ENABLE_COMPLEX_TEMPLATE_EXPRESSIONS,
}

/**
 *
 * @param apiVersionFeature
 * @param apiVersion
 */
export function isAPIFeatureEnabled(
    apiVersionFeature: APIFeature,
    apiVersion: APIVersion
): boolean {
    switch (apiVersionFeature) {
        case APIFeature.LOWERCASE_SCOPE_TOKENS:
        case APIFeature.TREAT_ALL_PARSE5_ERRORS_AS_ERRORS:
            return apiVersion >= APIVersion.V59_246_WINTER_24;
        case APIFeature.DISABLE_OBJECT_REST_SPREAD_TRANSFORMATION:
        case APIFeature.SKIP_UNNECESSARY_REGISTER_DECORATORS:
        case APIFeature.USE_COMMENTS_FOR_FRAGMENT_BOOKENDS:
        case APIFeature.USE_FRAGMENTS_FOR_LIGHT_DOM_SLOTS:
            return apiVersion >= APIVersion.V60_248_SPRING_24;
        case APIFeature.ENABLE_ELEMENT_INTERNALS_AND_FACE:
        case APIFeature.USE_LIGHT_DOM_SLOT_FORWARDING:
            return apiVersion >= APIVersion.V61_250_SUMMER_24;
        case APIFeature.ENABLE_THIS_DOT_HOST_ELEMENT:
        case APIFeature.ENABLE_THIS_DOT_STYLE:
        case APIFeature.TEMPLATE_CLASS_NAME_OBJECT_BINDING:
            return apiVersion >= APIVersion.V62_252_WINTER_25;
        case APIFeature.ENABLE_COMPLEX_TEMPLATE_EXPRESSIONS:
            return apiVersion >= APIVersion.V63_254_SPRING_25;
    }
}
