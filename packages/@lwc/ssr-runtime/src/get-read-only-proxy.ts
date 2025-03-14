/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { ObservableMembrane } from 'observable-membrane';

const reactiveMembrane = new ObservableMembrane();

// Modeled after `getReadOnlyProxy` in `membrane.ts` in `engine-core`
// Return a proxy over the given object so that access is immutable
// https://github.com/salesforce/lwc/blob/e9db491/packages/%40lwc/engine-core/src/framework/membrane.ts#L29-L33
export function getReadOnlyProxy<T>(value: T): Readonly<T> {
    return reactiveMembrane.getReadOnlyProxy(value);
}

/**
 * DEPRECATED: This function allows you to create a reactive readonly
 * membrane around any object value.
 * WARNING: This function does *NOT* make the object read-only.
 * @param value any object
 * @returns the provided value
 * @deprecated
 */
export function readonly<T>(value: T): T {
    return value;
}
