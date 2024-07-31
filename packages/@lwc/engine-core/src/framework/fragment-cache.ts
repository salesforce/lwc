import { isUndefined } from '@lwc/shared';

export const enum FragmentCacheKey {
    HAS_SCOPED_STYLE = 1,
    SHADOW_MODE_SYNTHETIC = 2,
}

// Mapping of cacheKeys to token array (assumed to come from a tagged template literal) to an Element
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
