/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayFrom } from '@lwc/shared/language';

export const enum FragmentCacheKey {
    HAS_SCOPED_STYLE = 1,
    SHADOW_MODE_SYNTHETIC = 2,
}

// HAS_SCOPED_STYLE | SHADOW_MODE_SYNTHETIC = 3
const MAX_CACHE_KEY = 3;

// Mapping of cacheKeys to `string[]` (assumed to come from a tagged template literal) to an Element.
// Note that every unique tagged template literal will have a unique `string[]`. So by using `string[]`
// as the WeakMap key, we effectively associate each Element with a unique tagged template literal.
// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates
// Also note that this array only needs to be large enough to account for the maximum possible cache key
const fragmentCache: WeakMap<string[], Element>[] = ArrayFrom(
    { length: MAX_CACHE_KEY + 1 },
    () => new WeakMap()
);

// Only used in LWC's Karma tests
if (process.env.NODE_ENV === 'test-karma-lwc') {
    (window as any).__lwcResetFragmentCache = () => {
        for (let i = 0; i < fragmentCache.length; i++) {
            fragmentCache[i] = new WeakMap();
        }
    };
}

function checkIsBrowser() {
    // The fragment cache only serves prevent calling innerHTML multiple times which doesn't happen on the server.
    /* istanbul ignore next */
    if (!process.env.IS_BROWSER) {
        throw new Error(
            'The fragment cache is intended to only be used in @lwc/engine-dom, not @lwc/engine-server'
        );
    }
}

export function getFromFragmentCache(cacheKey: number, strings: string[]) {
    checkIsBrowser();
    return fragmentCache[cacheKey].get(strings);
}

export function setInFragmentCache(cacheKey: number, strings: string[], element: Element) {
    checkIsBrowser();
    fragmentCache[cacheKey].set(strings, element);
}
