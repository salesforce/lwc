/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Dependencies that we bundle into our output JS files to avoid CJS/ESM compat issues.
// These include packages owned by us (observable-membrane), as well as parse5
// and its single dependency (entities), which are bundled because it makes it simpler to distribute.
export const BUNDLED_DEPENDENCIES = [
    '@parse5/tools',
    'entities',
    'estree-walker',
    'observable-membrane',
    'parse5',
];
