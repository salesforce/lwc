/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export const enum FragmentCacheKey {
    HAS_SCOPED_STYLE = 1,
    SHADOW_MODE_SYNTHETIC = 2,
}

// Mapping of cacheKeys to `string[]` (assumed to come from a tagged template literal) to an Element.
// Note that every unique tagged template literal will have a unique `string[]`. So by using `string[]`
// as the WeakMap key, we effectively associate each Element with a unique tagged template literal.
// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates
// Also note that this array only needs to account for the maximum possible cache key, i.e. 3
// (HAS_SCOPED_STYLE | SHADOW_MODE_SYNTHETIC = 3), so length is 4
const fragmentCache: WeakMap<string[], Element>[] = [
    new WeakMap(),
    new WeakMap(),
    new WeakMap(),
    new WeakMap(),
];

// Only used in LWC's Karma tests
if (process.env.NODE_ENV === 'test-karma-lwc') {
    (window as any).__lwcResetFragmentCache = () => {
        for (let i = 0; i < fragmentCache.length; i++) {
            fragmentCache[i] = new WeakMap();
        }
    };
}

export function getFromFragmentCache(cacheKey: number, strings: string[]) {
    return fragmentCache[cacheKey].get(strings);
}

export function setInFragmentCache(cacheKey: number, strings: string[], element: Element) {
    fragmentCache[cacheKey].set(strings, element);
}
