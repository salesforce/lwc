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
const allVersionsSet = /*@__PURE__@*/ new Set(allVersions);

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
}

export function isAPIFeatureEnabled(
    apiVersionFeature: APIFeature,
    apiVersion: APIVersion
): boolean {
    switch (apiVersionFeature) {
        case APIFeature.LOWERCASE_SCOPE_TOKENS:
        case APIFeature.TREAT_ALL_PARSE5_ERRORS_AS_ERRORS:
            return apiVersion >= APIVersion.V59_246_WINTER_24;
    }
}
