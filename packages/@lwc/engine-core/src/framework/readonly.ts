/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { logError } from '../shared/logger';
import { getReadOnlyProxy } from './membrane';

/**
 * EXPERIMENTAL: This function allows you to create a reactive readonly
 * membrane around any object value. This API is subject to change or
 * being removed.
 * @param obj
 */
export function readonly(obj: any): any {
    if (process.env.NODE_ENV !== 'production') {
        // TODO [#1292]: Remove the readonly decorator
        if (arguments.length !== 1) {
            logError(
                '@readonly cannot be used as a decorator just yet, use it as a function with one argument to produce a readonly version of the provided value.'
            );
        }
    }
    return getReadOnlyProxy(obj);
}
