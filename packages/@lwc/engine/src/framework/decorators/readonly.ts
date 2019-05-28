/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from '../../shared/assert';
import { reactiveMembrane } from '../membrane';

/**
 * EXPERIMENTAL: This function allows you to create a reactive readonly
 * membrane around any object value. This API is subject to change or
 * being removed.
 */
export default function readonly(obj: any): any {
    if (process.env.NODE_ENV !== 'production') {
        // TODO: enable the usage of this function as @readonly decorator
        if (arguments.length !== 1) {
            assert.fail(
                '@readonly cannot be used as a decorator just yet, use it as a function with one argument to produce a readonly version of the provided value.'
            );
        }
    }
    return reactiveMembrane.getReadOnlyProxy(obj);
}
