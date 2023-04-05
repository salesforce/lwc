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
}

// These must be updated when the enum is updated.
// It's a bit annoying to do have to do this manually, but this makes the file tree-shakeable,
// passing the `verify-treeshakeable.js` test.

export const LOWEST_API_VERSION = APIVersion.V58_244_SUMMER_23;
export const HIGHEST_API_VERSION = APIVersion.V59_246_WINTER_24;
const allVersions = [APIVersion.V58_244_SUMMER_23, APIVersion.V59_246_WINTER_24];
const allVersionsSet = new Set(allVersions);

export function getAPIVersionFromNumber(version: number | undefined): APIVersion {
    if (!isNumber(version) || version < LOWEST_API_VERSION) {
        return LOWEST_API_VERSION;
    }
    if (version > HIGHEST_API_VERSION) {
        return HIGHEST_API_VERSION;
    }
    if (allVersionsSet.has(version)) {
        return version;
    }
    // If it's a number, and it's within the bounds of our known versions, then we should find the
    // highest version lower than the requested number.
    // For instance, if we know about versions 1, 2, 5, and 6, and the user requests 3, then we should return 2.
    for (let i = 1; i < allVersions.length; i++) {
        if (allVersions[i] > version) {
            return allVersions[i - 1];
        }
    }
    // We should never hit this condition, but if we do, default to the lowest version to be safe
    /* istanbul ignore next */
    return LOWEST_API_VERSION;
}

export const enum APIFeature {
    /**
     * This is just used as a placeholder.
     */
    DUMMY_FEATURE,
    /**
     * If enabled, all parse5 errors will result in a compile-time error, rather than some being treated as warnings
     * (for backwards compatibility).
     */
    TREAT_ALL_PARSE5_ERRORS_AS_ERRORS,
    /**
     * If enabled, we use the native custom element lifecycle events: connectedCallback, disconnectedCallback
     * rather than synthetic events.
     */
    ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE,
    /**
     * If enabled, we do not emit unnecessary decorators for classes that cannot possibly be LightningElement
     * classes
     */
    AVOID_DECORATORS_FOR_NON_LIGHTNING_ELEMENT_CLASSES,
}

export function isAPIFeatureEnabled(apiVersionFeature: APIFeature, apiVersion: APIVersion) {
    switch (apiVersionFeature) {
        case APIFeature.DUMMY_FEATURE:
        case APIFeature.TREAT_ALL_PARSE5_ERRORS_AS_ERRORS:
        case APIFeature.ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE:
        case APIFeature.AVOID_DECORATORS_FOR_NON_LIGHTNING_ELEMENT_CLASSES:
            return apiVersion >= APIVersion.V59_246_WINTER_24;
    }
}
