/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, test, expect } from 'vitest';
import { APIFeature, APIVersion, isAPIFeatureEnabled, minApiVersion } from '../api-version';

describe('minApiVersion', () => {
    const cases: Array<[APIFeature, APIVersion]> = [
        [APIFeature.LOWERCASE_SCOPE_TOKENS, APIVersion.V59_246_WINTER_24],
        [APIFeature.TREAT_ALL_PARSE5_ERRORS_AS_ERRORS, APIVersion.V59_246_WINTER_24],
        [APIFeature.USE_FRAGMENTS_FOR_LIGHT_DOM_SLOTS, APIVersion.V60_248_SPRING_24],
        [APIFeature.DISABLE_OBJECT_REST_SPREAD_TRANSFORMATION, APIVersion.V60_248_SPRING_24],
        [APIFeature.SKIP_UNNECESSARY_REGISTER_DECORATORS, APIVersion.V60_248_SPRING_24],
        [APIFeature.USE_COMMENTS_FOR_FRAGMENT_BOOKENDS, APIVersion.V60_248_SPRING_24],
        [APIFeature.ENABLE_ELEMENT_INTERNALS_AND_FACE, APIVersion.V61_250_SUMMER_24],
        [APIFeature.USE_LIGHT_DOM_SLOT_FORWARDING, APIVersion.V61_250_SUMMER_24],
        [APIFeature.ENABLE_THIS_DOT_HOST_ELEMENT, APIVersion.V62_252_WINTER_25],
        [APIFeature.ENABLE_THIS_DOT_STYLE, APIVersion.V62_252_WINTER_25],
        [APIFeature.TEMPLATE_CLASS_NAME_OBJECT_BINDING, APIVersion.V62_252_WINTER_25],
        [APIFeature.ENABLE_COMPLEX_TEMPLATE_EXPRESSIONS, APIVersion.V66_260_SPRING_26],
    ];
    test.for(cases)('%s resolves to the expected API version', ([feature, expected]) => {
        expect(minApiVersion(feature)).toBe(expected);
    });
});

describe('isAPIFeatureEnabled', () => {
    test('is true when the API version is at or above the minimum', () => {
        expect(
            isAPIFeatureEnabled(
                APIFeature.ENABLE_COMPLEX_TEMPLATE_EXPRESSIONS,
                APIVersion.V66_260_SPRING_26
            )
        ).toBe(true);
    });

    test('is false when the API version is below the minimum', () => {
        expect(
            isAPIFeatureEnabled(
                APIFeature.ENABLE_COMPLEX_TEMPLATE_EXPRESSIONS,
                APIVersion.V59_246_WINTER_24
            )
        ).toBe(false);
    });

    test('is false exactly one version below the minimum', () => {
        expect(
            isAPIFeatureEnabled(
                APIFeature.ENABLE_COMPLEX_TEMPLATE_EXPRESSIONS,
                APIVersion.V65_258_WINTER_26
            )
        ).toBe(false);
    });

    test('is true well above the minimum', () => {
        expect(
            isAPIFeatureEnabled(
                APIFeature.ENABLE_ELEMENT_INTERNALS_AND_FACE,
                APIVersion.V66_260_SPRING_26
            )
        ).toBe(true);
    });
});
