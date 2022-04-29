/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import features from '@lwc/features';

if (process.env.NODE_ENV !== 'production') {
    if (features.ENABLE_TEST_EXCEPTION) {
        throw new Error('Compile-time processing of feature flags is broken.');
    }
}
