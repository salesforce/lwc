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

    let res = '';

    if (isString(value)) {
        res = value;
    } else if (isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            const normalized = normalizeClass(value[i]);
            if (normalized) {
                res += normalized + ' ';
            }
        }
    } else if (isObject(value) && !isNull(value)) {
        // Iterate own enumerable keys of the object
        const _keys = keys(value);
        for (let i = 0; i < _keys.length; i += 1) {
            const key = _keys[i];
            if ((value as Record<string, unknown>)[key]) {
                res += key + ' ';
            }
        }
    }

    return StringTrim.call(res);
}
