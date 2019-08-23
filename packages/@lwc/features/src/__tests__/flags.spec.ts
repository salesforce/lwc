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
            import { ENABLE_FEATURE_TRUE, runtimeFlags } from '@lwc/features';

            if (runtimeFlags.ENABLE_FEATURE_TRUE) {
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
            import { ENABLE_FEATURE_FALSE, runtimeFlags } from '@lwc/features';

            if (runtimeFlags.ENABLE_FEATURE_FALSE) {
              console.log('ENABLE_FEATURE_FALSE');
            }
        `,
    },
    'should not tramsform feature flags unless the if-test is a plain indentifier': {
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
            import { ENABLE_FEATURE_TRUE, ENABLE_FEATURE_FALSE, ENABLE_FEATURE_NULL, runtimeFlags } from '@lwc/features';

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
    'should not transform identifiers that look like feature flags but are not imported': {
        code: `
            import { ENABLE_FEATURE_TRUE } from '@lwc/features';
            const ENABLE_FEATURE_FALSE = true;
            if (ENABLE_FEATURE_FALSE) {
                console.log('ENABLE_FEATURE_FALSE');
            }
            function awesome() {
                const ENABLE_FEATURE_TRUE = null;
                if (ENABLE_FEATURE_TRUE) {
                    console.log('ENABLE_FEATURE_TRUE');
                }
            }
        `,
        output: `
            import { ENABLE_FEATURE_TRUE, runtimeFlags } from '@lwc/features';
            const ENABLE_FEATURE_FALSE = true;

            if (ENABLE_FEATURE_FALSE) {
              console.log('ENABLE_FEATURE_FALSE');
            }

            function awesome() {
              const ENABLE_FEATURE_TRUE = null;

              if (ENABLE_FEATURE_TRUE) {
                console.log('ENABLE_FEATURE_TRUE');
              }
            }
        `,
    },
    'should not transform feature flags when used with a ternary operator': {
        code: `
            import { ENABLE_FEATURE_NULL } from '@lwc/features';
            console.log(ENABLE_FEATURE_NULL ? 'foo' : 'bar');
        `,
        output: `
            import { ENABLE_FEATURE_NULL, runtimeFlags } from '@lwc/features';
            console.log(ENABLE_FEATURE_NULL ? 'foo' : 'bar');
        `,
    },
    'should not transform nested feature flags': {
        code: `
            import { ENABLE_FEATURE_TRUE, ENABLE_FEATURE_NULL } from '@lwc/features';
            if (ENABLE_FEATURE_NULL) {
                if (ENABLE_FEATURE_TRUE) {
                    console.log('this looks like a bad idea');
                }
            }
        `,
        output: `
            import { ENABLE_FEATURE_TRUE, ENABLE_FEATURE_NULL, runtimeFlags } from '@lwc/features';

            if (runtimeFlags.ENABLE_FEATURE_NULL) {
              if (ENABLE_FEATURE_TRUE) {
                console.log('this looks like a bad idea');
              }
            }
        `,
    },
    'should ignore invalid feature flags': {
        code: `
            import { invalidFeatureFlag } from '@lwc/features';
            if (invalidFeatureFlag) {
                console.log('invalidFeatureFlag');
            }
        `,
        output: `
            import { invalidFeatureFlag, runtimeFlags } from '@lwc/features';

            if (invalidFeatureFlag) {
              console.log('invalidFeatureFlag');
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

pluginTester({
    title: 'prod environments',
    plugin,
    pluginOptions: {
        featureFlags,
        prod: true,
    },
    babelOptions,
    tests: Object.assign({}, nonProdTests, {
        // Override of nonProdTest version
        'should transform boolean-true feature flags': {
            code: `
                import { ENABLE_FEATURE_TRUE } from '@lwc/features';
                if (ENABLE_FEATURE_TRUE) {
                    console.log('ENABLE_FEATURE_TRUE');
                }
            `,
            output: `
                import { ENABLE_FEATURE_TRUE, runtimeFlags } from '@lwc/features';
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
                import { ENABLE_FEATURE_FALSE, runtimeFlags } from '@lwc/features';
            `,
        },
        'should transform both boolean and null feature flags': {
            code: `
                import { ENABLE_FEATURE_TRUE, ENABLE_FEATURE_FALSE, ENABLE_FEATURE_NULL } from '@lwc/features';
                if (ENABLE_FEATURE_TRUE) {
                    console.log('ENABLE_FEATURE_TRUE');
                }
                if (ENABLE_FEATURE_FALSE) {
                    console.log('ENABLE_FEATURE_FALSE');
                }
                if (ENABLE_FEATURE_NULL) {
                    console.log('ENABLE_FEATURE_NULL');
                }
            `,
            output: `
                import { ENABLE_FEATURE_TRUE, ENABLE_FEATURE_FALSE, ENABLE_FEATURE_NULL, runtimeFlags } from '@lwc/features';
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
        'should not transform nested feature flags': {
            code: `
                import { ENABLE_FEATURE_TRUE, ENABLE_FEATURE_NULL } from '@lwc/features';
                if (ENABLE_FEATURE_NULL) {
                    if (ENABLE_FEATURE_TRUE) {
                        console.log('nested feature flags sounds like a vary bad idea');
                    }
                }
                if (ENABLE_FEATURE_TRUE) {
                    if (ENABLE_FEATURE_NULL) {
                        console.log('nested feature flags sounds like a vary bad idea');
                    }
                }
            `,
            output: `
                import { ENABLE_FEATURE_TRUE, ENABLE_FEATURE_NULL, runtimeFlags } from '@lwc/features';

                if (runtimeFlags.ENABLE_FEATURE_NULL) {
                  if (ENABLE_FEATURE_TRUE) {
                    console.log('nested feature flags sounds like a vary bad idea');
                  }
                }

                {
                  if (ENABLE_FEATURE_NULL) {
                    console.log('nested feature flags sounds like a vary bad idea');
                  }
                }
            `,
        },
    }),
});
