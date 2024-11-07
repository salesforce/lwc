/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { freeze, entries, isObject, isArray, create, isNull, ArrayMap } from '@lwc/shared';

// Deep freeze and clone an object. Designed for cloning/freezing child props when passed from a parent to a child so
// that they are immutable. This is one of the normal guarantees of both engine-dom and engine-server that we want to
// emulate in ssr-runtime. The goal here is that a child cannot mutate the props of its parent and thus affect
// the parent's rendering, which would lead to bidirectional reactivity and mischief.
export function cloneAndDeepFreeze<T>(obj: T): T {
    if (isArray(obj)) {
        const res = ArrayMap.call(obj, cloneAndDeepFreeze);
        freeze(res);
        return res;
    } else if (isObject(obj) && !isNull(obj)) {
        const res = create(null);
        for (const [key, value] of entries(obj)) {
            (res as any)[key] = cloneAndDeepFreeze(value);
        }
        freeze(res);
        return res;
    } else {
        // primitive
        return obj;
    }
}
