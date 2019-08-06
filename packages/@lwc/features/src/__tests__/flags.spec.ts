/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const pluginTester = require('babel-plugin-tester');
const plugin = require('../babel-plugin');

const nonProdTests = {
    'should transform boolean-true feature flags': {
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
    'should transform boolean-false feature flags': {
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
    'should not tramsform feature flags unless the if-test is an indentifier': {
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
    'should not transform identifiers that look like existing feature flags but are not imported': {
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
    // This should actually throw unless prod=true
    'should not transform runtime feature flag lookups': {
        code: `
            import { ENABLE_FEATURE_TRUE } from '@lwc/features';
            if (globalThis.LWC_config.feature.ENABLE_FEATURE_TRUE) {
                console.log('globalThis.LWC_config.feature.ENABLE_FEATURE_TRUE');
            }
        `,
        output: `
            import { ENABLE_FEATURE_TRUE } from '@lwc/features';

            if (globalThis.LWC_config.feature.ENABLE_FEATURE_TRUE) {
              console.log('globalThis.LWC_config.feature.ENABLE_FEATURE_TRUE');
            }
        `,
    },
    'should not transform feature flags when used with a ternary operator': {
        code: `
            import { ENABLE_FEATURE_NULL } from '@lwc/features';
            console.log(ENABLE_FEATURE_NULL ? 'foo' : 'bar');
        `,
        output: `
            import { ENABLE_FEATURE_NULL } from '@lwc/features';
            console.log(ENABLE_FEATURE_NULL ? 'foo' : 'bar');
        `,
    },
    'should not transform nested runtime feature flags': {
        code: `
            import { ENABLE_FEATURE_TRUE, ENABLE_FEATURE_NULL } from '@lwc/features';
            if (ENABLE_FEATURE_NULL) {
                if (ENABLE_FEATURE_TRUE) {
                    console.log('this looks like a bad idea');
                }
            }
        `,
        output: `
            import { ENABLE_FEATURE_TRUE, ENABLE_FEATURE_NULL } from '@lwc/features';

            if (globalThis.LWC_config.features.ENABLE_FEATURE_NULL) {
              if (ENABLE_FEATURE_TRUE) {
                console.log('this looks like a bad idea');
              }
            }
        `,
    },
};

pluginTester({
    title: 'non-prod environments',
    plugin,
    pluginOptions: {
        featureFlags: {
            ENABLE_FEATURE_TRUE: true,
            ENABLE_FEATURE_FALSE: false,
            ENABLE_FEATURE_NULL: null,
        },
    },
    tests: nonProdTests,
});

const prodTests = Object.assign({}, nonProdTests, {
    // Override of nonProdTest version
    'should transform boolean-true feature flags': {
        code: `
            import { ENABLE_FEATURE_TRUE } from '@lwc/features';
            if (ENABLE_FEATURE_TRUE) {
                console.log('ENABLE_FEATURE_TRUE');
            }
        `,
        output: `
            import { ENABLE_FEATURE_TRUE } from '@lwc/features';
            {
              console.log('ENABLE_FEATURE_TRUE');
            }
        `,
    },
    // Override of nonProdTest version
    'should transform boolean-false feature flags': {
        code: `
            import { ENABLE_FEATURE_FALSE } from '@lwc/features';
            if (ENABLE_FEATURE_FALSE) {
                console.log('ENABLE_FEATURE_FALSE');
            }
        `,
        output: `
            import { ENABLE_FEATURE_FALSE } from '@lwc/features';
        `,
    },
    'should transform runtime feature flag lookups into compile-time flags': {
        code: `
            import { ENABLE_FEATURE_TRUE, ENABLE_FEATURE_FALSE, ENABLE_FEATURE_NULL } from '@lwc/features';
            if (globalThis.LWC_config.features.ENABLE_FEATURE_TRUE) {
                console.log('globalThis.LWC_config.features.ENABLE_FEATURE_TRUE');
            }
            if (globalThis.LWC_config.features.ENABLE_FEATURE_FALSE) {
                console.log('globalThis.LWC_config.features.ENABLE_FEATURE_FALSE');
            }
            if (globalThis.LWC_config.features.ENABLE_FEATURE_NULL) {
                console.log('globalThis.LWC_config.features.ENABLE_FEATURE_NULL');
            }
        `,
        output: `
            import { ENABLE_FEATURE_TRUE, ENABLE_FEATURE_FALSE, ENABLE_FEATURE_NULL } from '@lwc/features';
            {
              console.log('globalThis.LWC_config.features.ENABLE_FEATURE_TRUE');
            }

            if (globalThis.LWC_config.features.ENABLE_FEATURE_NULL) {
              console.log('globalThis.LWC_config.features.ENABLE_FEATURE_NULL');
            }
        `,
    },
    'should not tramsform runtime feature flag lookups unless the if-test is a member expression': {
        code: `
            import { ENABLE_FEATURE_TRUE, ENABLE_FEATURE_FALSE, ENABLE_FEATURE_NULL } from '@lwc/features';
            if (globalThis.LWC_config.features.ENABLE_FEATURE_NULL === null) {
                console.log('globalThis.LWC_config.features.ENABLE_FEATURE_NULL === null');
            }
            if (isTrue(globalThis.LWC_config.features.ENABLE_FEATURE_TRUE)) {
                console.log('globalThis.LWC_config.features.ENABLE_FEATURE_TRUE');
            }
            if (!globalThis.LWC_config.features.ENABLE_FEATURE_FALSE) {
                console.log('!globalThis.LWC_config.features.ENABLE_FEATURE_FALSE');
            }
        `,
        output: `
            import { ENABLE_FEATURE_TRUE, ENABLE_FEATURE_FALSE, ENABLE_FEATURE_NULL } from '@lwc/features';

            if (globalThis.LWC_config.features.ENABLE_FEATURE_NULL === null) {
              console.log('globalThis.LWC_config.features.ENABLE_FEATURE_NULL === null');
            }

            if (isTrue(globalThis.LWC_config.features.ENABLE_FEATURE_TRUE)) {
              console.log('globalThis.LWC_config.features.ENABLE_FEATURE_TRUE');
            }

            if (!globalThis.LWC_config.features.ENABLE_FEATURE_FALSE) {
              console.log('!globalThis.LWC_config.features.ENABLE_FEATURE_FALSE');
            }
        `,
    },
    'should not transform member expressions that are not runtime feature flag lookups': {
        code: `
            import { ENABLE_FEATURE_TRUE } from '@lwc/features';
            if (globalThis.LWC_config.ENABLE_FEATURE_TRUE) {
                console.log('globalThis.LWC_config.ENABLE_FEATURE_TRUE');
            }
            if (globalThis.features.ENABLE_FEATURE_TRUE) {
                console.log('globalThis.features.ENABLE_FEATURE_TRUE');
            }
        `,
        output: `
            import { ENABLE_FEATURE_TRUE } from '@lwc/features';

            if (globalThis.LWC_config.ENABLE_FEATURE_TRUE) {
              console.log('globalThis.LWC_config.ENABLE_FEATURE_TRUE');
            }

            if (globalThis.features.ENABLE_FEATURE_TRUE) {
              console.log('globalThis.features.ENABLE_FEATURE_TRUE');
            }
        `,
    },
    'should not transform runtime feature flags when used with a ternary operator': {
        code: `
            import { ENABLE_FEATURE_NULL } from '@lwc/features';
            console.log(globalThis.LWC_config.features.ENABLE_FEATURE_NULL ? 'foo' : 'bar');
        `,
        output: `
            import { ENABLE_FEATURE_NULL } from '@lwc/features';
            console.log(globalThis.LWC_config.features.ENABLE_FEATURE_NULL ? 'foo' : 'bar');
        `,
    },
    'should not transform nested runtime feature flag lookups': {
        code: `
            import { ENABLE_FEATURE_TRUE, ENABLE_FEATURE_NULL } from '@lwc/features';
            if (ENABLE_FEATURE_NULL) {
                if (ENABLE_FEATURE_TRUE) {
                    console.log('nested feature flags sounds like a vary bad idea');
                }
            }
        `,
        output: `
            import { ENABLE_FEATURE_TRUE, ENABLE_FEATURE_NULL } from '@lwc/features';

            if (globalThis.LWC_config.features.ENABLE_FEATURE_NULL) {
              if (ENABLE_FEATURE_TRUE) {
                console.log('nested feature flags sounds like a vary bad idea');
              }
            }
        `,
    },
});

pluginTester({
    title: 'prod environments',
    plugin,
    pluginOptions: {
        featureFlags: {
            ENABLE_FEATURE_TRUE: true,
            ENABLE_FEATURE_FALSE: false,
            ENABLE_FEATURE_NULL: null,
        },
        prod: true,
    },
    tests: prodTests,
});
