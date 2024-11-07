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
export function getReadOnlyProxy(value: any) {
    return reactiveMembrane.getReadOnlyProxy(value);
}
