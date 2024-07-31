/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';

export const enum FragmentCacheKey {
    HAS_SCOPED_STYLE = 1,
    SHADOW_MODE_SYNTHETIC = 2,
}

// Mapping of cacheKeys to `string[]` (assumed to come from a tagged template literal) to an Element.
// Note that every unique tagged template literal will have a unique `string[]`. So by using `string[]`
// as the WeakMap key, we effectively associate each Element with a unique tagged template literal.
// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates
const fragmentCache: Map<number, WeakMap<string[], Element>> = new Map();

// Only used in LWC's Karma tests
if (process.env.NODE_ENV === 'test-karma-lwc') {
    (window as any).__lwcResetFragmentCache = () => {
        fragmentCache.clear();
    };
}

function getStringsToElementsMap(cacheKey: number) {
    let stringsToElementsMap = fragmentCache.get(cacheKey);
    if (isUndefined(stringsToElementsMap)) {
        stringsToElementsMap = new WeakMap();
        fragmentCache.set(cacheKey, stringsToElementsMap);
    }
    return stringsToElementsMap;
}

export function getFromFragmentCache(cacheKey: number, strings: string[]) {
    const stringsToElementsMap = getStringsToElementsMap(cacheKey);
    return stringsToElementsMap.get(strings);
}

export function setInFragmentCache(cacheKey: number, strings: string[], element: Element) {
    const stringsToElementsMap = getStringsToElementsMap(cacheKey);
    return stringsToElementsMap.set(strings, element);
}
