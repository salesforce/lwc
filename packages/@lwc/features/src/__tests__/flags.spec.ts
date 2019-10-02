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
            import featureFlags from '@lwc/features';
            if (featureFlags.ENABLE_FEATURE_TRUE) {
                console.log('ENABLE_FEATURE_TRUE');
            }
        `,
        output: `
            import featureFlags, { runtimeFlags } from '@lwc/features';

            if (runtimeFlags.ENABLE_FEATURE_TRUE) {
              console.log('ENABLE_FEATURE_TRUE');
            }
        `,
    },
    'should transform boolean-false feature flags': {
        code: `
            import features from '@lwc/features';
            if (features.ENABLE_FEATURE_FALSE) {
                console.log('ENABLE_FEATURE_FALSE');
            }
        `,
        output: `
            import features, { runtimeFlags } from '@lwc/features';

            if (runtimeFlags.ENABLE_FEATURE_FALSE) {
              console.log('ENABLE_FEATURE_FALSE');
            }
        `,
    },
    'should transform null feature flags': {
        code: `
            import features from '@lwc/features';
            if (features.ENABLE_FEATURE_NULL) {
                console.log('ENABLE_FEATURE_NULL');
            }
        `,
        output: `
            import features, { runtimeFlags } from '@lwc/features';

            if (runtimeFlags.ENABLE_FEATURE_NULL) {
              console.log('ENABLE_FEATURE_NULL');
            }
        `,
    },
    'should not transform feature flags unless the if-test is a simple member expression': {
        code: `
            import FEATURES from '@lwc/features';
            if (FEATURES.ENABLE_FEATURE_NULL === null) {
                console.log('ENABLE_FEATURE_NULL === null');
            }
            if (isTrue(FEATURES.ENABLE_FEATURE_TRUE)) {
                console.log('isTrue(ENABLE_FEATURE_TRUE)');
            }
            if (!FEATURES.ENABLE_FEATURE_FALSE) {
                console.log('!ENABLE_FEATURE_FALSE');
            }
        `,
        output: `
            import FEATURES, { runtimeFlags } from '@lwc/features';

            if (FEATURES.ENABLE_FEATURE_NULL === null) {
              console.log('ENABLE_FEATURE_NULL === null');
            }

            if (isTrue(FEATURES.ENABLE_FEATURE_TRUE)) {
              console.log('isTrue(ENABLE_FEATURE_TRUE)');
            }

            if (!FEATURES.ENABLE_FEATURE_FALSE) {
              console.log('!ENABLE_FEATURE_FALSE');
            }
        `,
    },
    'should not transform tests that are not an actual reference to the imported binding': {
        code: `
            import featureFlag from '@lwc/features';
            if (featureFlag.ENABLE_FEATURE_FALSE) {
                console.log('ENABLE_FEATURE_FALSE');
            }
            function awesome() {
                const featureFlag = { ENABLE_FEATURE_FALSE: false };
                if (featureFlag.ENABLE_FEATURE_FALSE) {
                    console.log('ENABLE_FEATURE_FALSE');
                }
            }
        `,
        output: `
            import featureFlag, { runtimeFlags } from '@lwc/features';

            if (runtimeFlags.ENABLE_FEATURE_FALSE) {
              console.log('ENABLE_FEATURE_FALSE');
            }

            function awesome() {
              const featureFlag = {
                ENABLE_FEATURE_FALSE: false
              };

              if (featureFlag.ENABLE_FEATURE_FALSE) {
                console.log('ENABLE_FEATURE_FALSE');
              }
            }
        `,
    },
    'should not transform feature flags when used with a ternary operator': {
        code: `
            import feats from '@lwc/features';
            console.log(feats.ENABLE_FEATURE_NULL ? 'foo' : 'bar');
        `,
        output: `
            import feats, { runtimeFlags } from '@lwc/features';
            console.log(feats.ENABLE_FEATURE_NULL ? 'foo' : 'bar');
        `,
    },
    'should transform nested feature flags': {
        code: `
            import featureFlags from '@lwc/features';
            if (featureFlags.ENABLE_FEATURE_NULL) {
                if (featureFlags.ENABLE_FEATURE_TRUE) {
                    console.log('this looks like a bad idea');
                }
            }
        `,
        output: `
            import featureFlags, { runtimeFlags } from '@lwc/features';

            if (runtimeFlags.ENABLE_FEATURE_NULL) {
              if (runtimeFlags.ENABLE_FEATURE_TRUE) {
                console.log('this looks like a bad idea');
              }
            }
        `,
    },
};

const featureFlags = {
    ENABLE_FEATURE_TRUE: true,
    ENABLE_FEATURE_FALSE: false,
    ENABLE_FEATURE_NULL: null,
    invalidFeatureFlag: true, // invalid because it's not all uppercase
};

const babelOptions = {
    babelrc: false,
    configFile: false,
};

pluginTester({
    title: 'non-prod environments',
    plugin,
    pluginOptions: {
        featureFlags,
    },
    babelOptions,
    tests: nonProdTests,
});

// These tests override corresponding tests in nonProdTests since the plugin has
// different outputs when prod:true.
const nonProdTestOverrides = {
    'should transform boolean-true feature flags': {
        code: `
            import features from '@lwc/features';
            if (features.ENABLE_FEATURE_TRUE) {
                console.log('ENABLE_FEATURE_TRUE');
            }
        `,
        output: `
          import features, { runtimeFlags } from '@lwc/features';
          {
            console.log('ENABLE_FEATURE_TRUE');
          }
        `,
    },
    'should transform boolean-false feature flags': {
        code: `
            import features from '@lwc/features';
            if (features.ENABLE_FEATURE_FALSE) {
                console.log('ENABLE_FEATURE_FALSE');
            }
        `,
        output: `
          import features, { runtimeFlags } from '@lwc/features';
        `,
    },
    'should transform nested feature flags': {
        code: `
            import features from '@lwc/features';
            if (features.ENABLE_FEATURE_NULL) {
                if (features.ENABLE_FEATURE_TRUE) {
                    console.log('nested feature flags sounds like a vary bad idea');
                }
            }
            if (features.ENABLE_FEATURE_TRUE) {
                if (features.ENABLE_FEATURE_NULL) {
                    console.log('nested feature flags sounds like a vary bad idea');
                }
            }
        `,
        output: `
          import features, { runtimeFlags } from '@lwc/features';

          if (runtimeFlags.ENABLE_FEATURE_NULL) {
            {
              console.log('nested feature flags sounds like a vary bad idea');
            }
          }

          {
            if (runtimeFlags.ENABLE_FEATURE_NULL) {
              console.log('nested feature flags sounds like a vary bad idea');
            }
          }
        `,
    },
    'should not transform tests that are not an actual reference to the imported binding': {
        code: `
            import featureFlag from '@lwc/features';
            if (featureFlag.ENABLE_FEATURE_FALSE) {
                console.log('ENABLE_FEATURE_FALSE');
            }
            function awesome() {
                const featureFlag = { ENABLE_FEATURE_FALSE: false };
                if (featureFlag.ENABLE_FEATURE_FALSE) {
                    console.log('ENABLE_FEATURE_FALSE');
                }
            }
        `,
        output: `
            import featureFlag, { runtimeFlags } from '@lwc/features';

            function awesome() {
              const featureFlag = {
                ENABLE_FEATURE_FALSE: false
              };

              if (featureFlag.ENABLE_FEATURE_FALSE) {
                console.log('ENABLE_FEATURE_FALSE');
              }
            }
        `,
    },
};

pluginTester({
    title: 'prod environments',
    plugin,
    pluginOptions: {
        featureFlags,
        prod: true,
    },
    babelOptions,
    tests: Object.assign({}, nonProdTests, nonProdTestOverrides, {
        'should transform both boolean and null feature flags': {
            code: `
                import features from '@lwc/features';
                if (features.ENABLE_FEATURE_TRUE) {
                    console.log('ENABLE_FEATURE_TRUE');
                }
                if (features.ENABLE_FEATURE_FALSE) {
                    console.log('ENABLE_FEATURE_FALSE');
                }
                if (features.ENABLE_FEATURE_NULL) {
                    console.log('ENABLE_FEATURE_NULL');
                }
            `,
            output: `
                import features, { runtimeFlags } from '@lwc/features';
                {
                  console.log('ENABLE_FEATURE_TRUE');
                }

                if (runtimeFlags.ENABLE_FEATURE_NULL) {
                  console.log('ENABLE_FEATURE_NULL');
                }
            `,
        },
        'should transform runtime flag lookups into compile-time flags': {
            code: `
                if (runtimeFlags.ENABLE_FEATURE_TRUE) {
                    console.log('runtimeFlags.ENABLE_FEATURE_TRUE');
                }
                if (runtimeFlags.ENABLE_FEATURE_FALSE) {
                    console.log('runtimeFlags.ENABLE_FEATURE_FALSE');
                }
                if (runtimeFlags.ENABLE_FEATURE_NULL) {
                    console.log('runtimeFlags.ENABLE_FEATURE_NULL');
                }
            `,
            output: `
                {
                  console.log('runtimeFlags.ENABLE_FEATURE_TRUE');
                }

                if (runtimeFlags.ENABLE_FEATURE_NULL) {
                  console.log('runtimeFlags.ENABLE_FEATURE_NULL');
                }
            `,
        },
        'should not transform runtime flag lookups unless the if-test is a member expression': {
            code: `
                if (runtimeFlags.ENABLE_FEATURE_NULL === null) {
                    console.log('runtimeFlags.ENABLE_FEATURE_NULL === null');
                }
                if (isTrue(runtimeFlags.ENABLE_FEATURE_TRUE)) {
                    console.log('runtimeFlags.ENABLE_FEATURE_TRUE');
                }
                if (!runtimeFlags.ENABLE_FEATURE_FALSE) {
                    console.log('!runtimeFlags.ENABLE_FEATURE_FALSE');
                }
            `,
            output: `
                if (runtimeFlags.ENABLE_FEATURE_NULL === null) {
                  console.log('runtimeFlags.ENABLE_FEATURE_NULL === null');
                }

                if (isTrue(runtimeFlags.ENABLE_FEATURE_TRUE)) {
                  console.log('runtimeFlags.ENABLE_FEATURE_TRUE');
                }

                if (!runtimeFlags.ENABLE_FEATURE_FALSE) {
                  console.log('!runtimeFlags.ENABLE_FEATURE_FALSE');
                }
            `,
        },
        'should not transform member expressions that are not runtime flag lookups': {
            code: `
                if (churroteria.ENABLE_FEATURE_TRUE) {
                    console.log('churroteria.ENABLE_FEATURE_TRUE');
                }
            `,
            output: `
                if (churroteria.ENABLE_FEATURE_TRUE) {
                  console.log('churroteria.ENABLE_FEATURE_TRUE');
                }
            `,
        },
        'should not transform runtime flags when used with a ternary operator': {
            code: `
                console.log(runtimeFlags.ENABLE_FEATURE_NULL ? 'foo' : 'bar');
            `,
            output: `
                console.log(runtimeFlags.ENABLE_FEATURE_NULL ? 'foo' : 'bar');
            `,
        },
    }),
});
