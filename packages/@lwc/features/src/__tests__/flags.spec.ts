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
    title: 'non-prod environments',
    tests: {
        'should transform boolean feature flags (true)': {
            code: `
                import { ENABLE_FEATURE_TRUE } from '@lwc/features';
                if (ENABLE_FEATURE_TRUE) {
                    console.log('ENABLE_FEATURE_TRUE');
                }
            `,
            output: `
                import { ENABLE_FEATURE_TRUE } from '@lwc/features';

                if (globalThis.LWC_config.features.ENABLE_FEATURE_TRUE) {
                  console.log('ENABLE_FEATURE_TRUE');
                }
            `,
        },
        'should transform boolean feature flags (false)': {
            code: `
                import { ENABLE_FEATURE_FALSE } from '@lwc/features';
                if (ENABLE_FEATURE_FALSE) {
                    console.log('ENABLE_FEATURE_FALSE');
                }
            `,
            output: `
                import { ENABLE_FEATURE_FALSE } from '@lwc/features';

                if (globalThis.LWC_config.features.ENABLE_FEATURE_FALSE) {
                  console.log('ENABLE_FEATURE_FALSE');
                }
            `,
        },
        'should not transform feature flags unless the if-test is an identifier': {
            code: `
                import { ENABLE_FEATURE_TRUE, ENABLE_FEATURE_FALSE, ENABLE_FEATURE_NULL } from '@lwc/features';
                if (ENABLE_FEATURE_NULL === null) {
                    console.log('ENABLE_FEATURE_NULL === null');
                }
                if (isTrue(ENABLE_FEATURE_TRUE)) {
                    console.log('isTrue(ENABLE_FEATURE_TRUE)');
                }
                if (!ENABLE_FEATURE_FALSE) {
                    console.log('!ENABLE_FEATURE_FALSE');
                }
            `,
            output: `
                import { ENABLE_FEATURE_TRUE, ENABLE_FEATURE_FALSE, ENABLE_FEATURE_NULL } from '@lwc/features';

                if (ENABLE_FEATURE_NULL === null) {
                  console.log('ENABLE_FEATURE_NULL === null');
                }

                if (isTrue(ENABLE_FEATURE_TRUE)) {
                  console.log('isTrue(ENABLE_FEATURE_TRUE)');
                }

                if (!ENABLE_FEATURE_FALSE) {
                  console.log('!ENABLE_FEATURE_FALSE');
                }
            `,
        },
        'should not transform identifiers that look like feature flags': {
            code: `
                import { ENABLE_FEATURE_FOO } from '@lwc/features';
                const ENABLE_FEATURE_BAR = true;
                if (ENABLE_FEATURE_BAR) {
                    console.log('ENABLE_FEATURE_BAR');
                }
            `,
            output: `
                import { ENABLE_FEATURE_FOO } from '@lwc/features';
                const ENABLE_FEATURE_BAR = true;

                if (ENABLE_FEATURE_BAR) {
                  console.log('ENABLE_FEATURE_BAR');
                }
            `,
        },
        'should not transform globalThis runtime feature flags': {
            code: `
                import { ENABLE_FEATURE_JAPAN } from '@lwc/features';
                if (globalThis.LWC_config.feature.ENABLE_FEATURE_JAPAN) {
                    console.log('globalThis.LWC_config.feature.ENABLE_FEATURE_JAPAN');
                }
            `,
            output: `
                import { ENABLE_FEATURE_JAPAN } from '@lwc/features';

                if (globalThis.LWC_config.feature.ENABLE_FEATURE_JAPAN) {
                  console.log('globalThis.LWC_config.feature.ENABLE_FEATURE_JAPAN');
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
                  if (globalThis.LWC_config.features.ENABLE_FEATURE_TRUE) {
                    console.log('wow are you sure you know what you are doing?');
                  }
                }
            `,
        },
    },
});
