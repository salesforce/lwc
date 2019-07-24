/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const pluginTester = require('babel-plugin-tester');
const plugin = require('../babel-plugin');

pluginTester({
    plugin,
    pluginOptions: {
        featureFlags: {
            ENABLE_FEATURE_TRUE: true,
            ENABLE_FEATURE_FALSE: false,
            ENABLE_FEATURE_NULL: null,
        },
    },
    tests: {
        'should not transform boolean feature flags (true)': {
            code: `
                import { ENABLE_FEATURE_TRUE } from '@lwc/features';
                if (ENABLE_FEATURE_TRUE) {
                    console.log('this plugin only handles runtime feature flags');
                }
            `,
            output: `
                import { ENABLE_FEATURE_TRUE } from '@lwc/features';

                if (ENABLE_FEATURE_TRUE) {
                  console.log('this plugin only handles runtime feature flags');
                }
            `,
        },
        'should not transform boolean feature flags (false)': {
            code: `
                import { ENABLE_FEATURE_FALSE } from '@lwc/features';
                if (ENABLE_FEATURE_FALSE) {
                    console.log('this plugin only handles runtime feature flags');
                }
            `,
            output: `
                import { ENABLE_FEATURE_FALSE } from '@lwc/features';

                if (ENABLE_FEATURE_FALSE) {
                  console.log('this plugin only handles runtime feature flags');
                }
            `,
        },
        'should transform runtime feature flags only when they are used in an if-statement': {
            code: `
                import { ENABLE_FEATURE_NULL } from '@lwc/features';
                if (ENABLE_FEATURE_NULL) {
                    console.log('this is an experimental feature');
                }
                if (isTrue(ENABLE_FEATURE_NULL)) {
                    console.log('this is an experimental feature');
                }
                if (ENABLE_FEATURE_NULL === true) {
                    console.log('this is an experimental feature');
                }
            `,
            output: `
                import { ENABLE_FEATURE_NULL } from '@lwc/features';

                if (globalThis.LWC_config.features.ENABLE_FEATURE_NULL) {
                  console.log('this is an experimental feature');
                }

                if (isTrue(globalThis.LWC_config.features.ENABLE_FEATURE_NULL)) {
                  console.log('this is an experimental feature');
                }

                if (globalThis.LWC_config.features.ENABLE_FEATURE_NULL === true) {
                  console.log('this is an experimental feature');
                }
            `,
        },
        'should not transform runtime feature flags when used with a ternary operator': {
            code: `
                import { ENABLE_FEATURE_NULL } from '@lwc/features';
                console.log(ENABLE_FEATURE_NULL ? 'is null' : 'is not null');
            `,
            output: `
                import { ENABLE_FEATURE_NULL } from '@lwc/features';
                console.log(ENABLE_FEATURE_NULL ? 'is null' : 'is not null');
            `,
        },
        'should transform nested runtime feature flags': {
            code: `
                import { ENABLE_FEATURE_TRUE, ENABLE_FEATURE_NULL } from '@lwc/features';
                if (ENABLE_FEATURE_NULL) {
                    if (ENABLE_FEATURE_TRUE) {
                        console.log('wow are you sure you know what you are doing?');
                    }
                }
            `,
            output: `
                import { ENABLE_FEATURE_TRUE, ENABLE_FEATURE_NULL } from '@lwc/features';

                if (globalThis.LWC_config.features.ENABLE_FEATURE_NULL) {
                  if (ENABLE_FEATURE_TRUE) {
                    console.log('wow are you sure you know what you are doing?');
                  }
                }
            `,
        },
    },
});
