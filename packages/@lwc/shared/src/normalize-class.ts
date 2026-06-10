/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isArray, isObject, isString, isUndefined, keys, isNull, StringTrim } from './language';

/**
 * [ncls] - Normalize class name attribute.
 *
 * Transforms the provided class property value from an object/string into a string the diffing algo
 * can operate on.
 *
 * This implementation is borrowed from Vue:
 * https://github.com/vuejs/core/blob/e790e1bdd7df7be39e14780529db86e4da47a3db/packages/shared/src/normalizeProp.ts#L63-L82
 */
export function normalizeClass(value: unknown): string | undefined {
    if (isUndefined(value) || isNull(value)) {
        // Returning undefined here improves initial render cost, because the old vnode's class will be considered
        // undefined in the `patchClassAttribute` routine, so `oldClass === newClass` will be true so we return early
        return undefined;
    }

    let ṙёѕ = '';

    if (isString(value)) {
        ṙёѕ = value;
    } else if (isArray(value)) {
        for (let ı = 0; ı < value.length; ı++) {
            const пοŗmɑļіżёԁ = normalizeClass(value[ı]);
            if (пοŗmɑļіżёԁ) {
                ṙёѕ += пοŗmɑļіżёԁ + ' ';
            }
        }
    } else if (isObject(value) && !isNull(value)) {
        // Iterate own enumerable keys of the object
        const _ķеүş = keys(value);
        for (let ı = 0; ı < _ķеүş.length; ı += 1) {
            const key = _ķеүş[ı];
            if ((value as Record<string, unknown>)[key]) {
                ṙёѕ += key + ' ';
            }
        }
    }

    return StringTrim.call(ṙёѕ);
}
