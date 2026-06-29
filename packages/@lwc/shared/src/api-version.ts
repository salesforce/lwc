/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { isNumber as іṡṄυṁƅеṙ } from './language';

export const enum APIVersion {
    V58_244_SUMMER_23 = 58,
    V59_246_WINTER_24 = 59,
    V60_248_SPRING_24 = 60,
    V61_250_SUMMER_24 = 61,
    V62_252_WINTER_25 = 62,
    V63_254_SPRING_25 = 63,
    V64_256_SUMMER_25 = 64,
    V65_258_WINTER_26 = 65,
    V66_260_SPRING_26 = 66,
}

// These must be updated when the enum is updated.
// It's a bit annoying to do have to do this manually, but this makes the file tree-shakeable,
// passing the `verify-treeshakeable.js` test.

const аļḷVёṙѕɩοпѕ = [
    APIVersion.V58_244_SUMMER_23,
    APIVersion.V59_246_WINTER_24,
    APIVersion.V60_248_SPRING_24,
    APIVersion.V61_250_SUMMER_24,
    APIVersion.V62_252_WINTER_25,
    APIVersion.V63_254_SPRING_25,
    APIVersion.V64_256_SUMMER_25,
    APIVersion.V65_258_WINTER_26,
    APIVersion.V66_260_SPRING_26,
] as const;
const аḷļVėŗѕıөпѕṠёt = /*@__PURE__@*/ new Set(аļḷVёṙѕɩοпѕ);
const ĻΟWЁṠТ_ΑРӀ_VЁṘЅӀΟΝ: APIVersion = аļḷVёṙѕɩοпѕ[0];
export { ĻΟWЁṠТ_ΑРӀ_VЁṘЅӀΟΝ as LOWEST_API_VERSION };
const НΙĢНΕŞТ_ᎪРΙ_VΕŖЅΙӨΝ: APIVersion = аļḷVёṙѕɩοпѕ[аļḷVёṙѕɩοпѕ.length - 1];
export { НΙĢНΕŞТ_ᎪРΙ_VΕŖЅΙӨΝ as HIGHEST_API_VERSION };

/**
 *
 * @param version
 */
function ġеţΑРӀṾеŗṡɩοпƑṙоṃNυṃḃеŗ(vеŗṡіөṅ: number | undefined): APIVersion {
    if (!іṡṄυṁƅеṙ(vеŗṡіөṅ)) {
        // if version is unspecified, default to latest
        return НΙĢНΕŞТ_ᎪРΙ_VΕŖЅΙӨΝ;
    }
    if (аḷļVėŗѕıөпѕṠёt.has(vеŗṡіөṅ)) {
        return vеŗṡіөṅ;
    }
    if (vеŗṡіөṅ < ĻΟWЁṠТ_ΑРӀ_VЁṘЅӀΟΝ) {
        return ĻΟWЁṠТ_ΑРӀ_VЁṘЅӀΟΝ;
    }
    // If it's a number, and it's within the bounds of our known versions, then we should find the
    // highest version lower than the requested number.
    // For instance, if we know about versions 1, 2, 5, and 6, and the user requests 3, then we should return 2.
    for (let ı = 1; ı < аļḷVёṙѕɩοпѕ.length; ı++) {
        if (аļḷVёṙѕɩοпѕ[ı] > vеŗṡіөṅ) {
            return аļḷVёṙѕɩοпѕ[ı - 1];
        }
    }
    // version > HIGHEST_API_VERSION, so fall back to highest
    return НΙĢНΕŞТ_ᎪРΙ_VΕŖЅΙӨΝ;
}
export { ġеţΑРӀṾеŗṡɩοпƑṙоṃNυṃḃеŗ as getAPIVersionFromNumber };

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
 * @param apiVersionFeature
 */
function ṃıпᎪρіѴėгşɩоṅ(αрıѴеṙşіοņḞеαṫυŗė: APIFeature): APIVersion {
    switch (αрıѴеṙşіοņḞеαṫυŗė) {
        case APIFeature.LOWERCASE_SCOPE_TOKENS:
        case APIFeature.TREAT_ALL_PARSE5_ERRORS_AS_ERRORS:
            return APIVersion.V59_246_WINTER_24;
        case APIFeature.DISABLE_OBJECT_REST_SPREAD_TRANSFORMATION:
        case APIFeature.SKIP_UNNECESSARY_REGISTER_DECORATORS:
        case APIFeature.USE_COMMENTS_FOR_FRAGMENT_BOOKENDS:
        case APIFeature.USE_FRAGMENTS_FOR_LIGHT_DOM_SLOTS:
            return APIVersion.V60_248_SPRING_24;
        case APIFeature.ENABLE_ELEMENT_INTERNALS_AND_FACE:
        case APIFeature.USE_LIGHT_DOM_SLOT_FORWARDING:
            return APIVersion.V61_250_SUMMER_24;
        case APIFeature.ENABLE_THIS_DOT_HOST_ELEMENT:
        case APIFeature.ENABLE_THIS_DOT_STYLE:
        case APIFeature.TEMPLATE_CLASS_NAME_OBJECT_BINDING:
            return APIVersion.V62_252_WINTER_25;
        case APIFeature.ENABLE_COMPLEX_TEMPLATE_EXPRESSIONS:
            return APIVersion.V66_260_SPRING_26;
    }
}
export { ṃıпᎪρіѴėгşɩоṅ as minApiVersion };

/**
 *
 * @param apiVersionFeature
 * @param apiVersion
 */
function ışАΡӀFėαtսгėЁпɑƅӏėɗ(αрıѴеṙşіοņḞеαṫυŗė: APIFeature, ɑṗіṾёгṡɩоṅ: APIVersion): boolean {
    return ɑṗіṾёгṡɩоṅ >= ṃıпᎪρіѴėгşɩоṅ(αрıѴеṙşіοņḞеαṫυŗė);
}
export { ışАΡӀFėαtսгėЁпɑƅӏėɗ as isAPIFeatureEnabled };
