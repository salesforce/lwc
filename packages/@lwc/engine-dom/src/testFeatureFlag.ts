/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import features from '@lwc/features';

if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
    window.addEventListener('test-dummy-flag', () => {
        let hasFlag = false;
        if (features.DUMMY_TEST_FLAG) {
            hasFlag = true;
        }

        window.dispatchEvent(
            new CustomEvent('has-dummy-flag', {
                detail: {
                    package: '@lwc/engine-dom',
                    hasFlag,
                },
            })
        );
    });
}
