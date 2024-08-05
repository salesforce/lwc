/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { ArrayFill, ArrayMap } from '@lwc/shared';

export const enum FragmentCacheKey {
    HAS_SCOPED_STYLE = 1,
    SHADOW_MODE_SYNTHETIC = 2,
}

// Maximum cache key we need to account for in the array size.
// (HAS_SCOPED_STYLE | SHADOW_MODE_SYNTHETIC = 3)
const MAX_CACHE_KEY = 3;

// Mapping of cacheKeys to `string[]` (assumed to come from a tagged template literal) to an Element.
// Note that every unique tagged template literal will have a unique `string[]`. So by using `string[]`
// as the WeakMap key, we effectively associate each Element with a unique tagged template literal.
// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates
const fragmentCache = ArrayMap.call(
    ArrayFill.call(new Array(MAX_CACHE_KEY + 1), undefined),
    () => new WeakMap()
) as WeakMap<string[], Element>[];

// Only used in LWC's Karma tests
if (process.env.NODE_ENV === 'test-karma-lwc') {
    (window as any).__lwcResetFragmentCache = () => {
        for (let i = 0; i < fragmentCache.length; i++) {
            fragmentCache[i] = new WeakMap();
        }
    };
}

export function getFromFragmentCache(cacheKey: number, strings: string[]) {
    const stringsToElementsMap = fragmentCache[cacheKey];
    return stringsToElementsMap.get(strings);
}

export function setInFragmentCache(cacheKey: number, strings: string[], element: Element) {
    const stringsToElementsMap = fragmentCache[cacheKey];
    return stringsToElementsMap.set(strings, element);
}
