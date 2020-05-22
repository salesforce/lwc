/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const pluginTest = require('./utils/test-transform').pluginTest(require('../index'));

describe('deduping imports', () => {
    pluginTest(
        'should handle the simple case',
        `
            import { foo, bar } from 'foo';
            import { baz } from 'foo';
        `,
        {
            output: {
                code: `
                import { foo, bar, baz } from 'foo';
                `,
            },
        }
    );

    pluginTest(
        'should support importing the entire contents for a module',
        `
            import { foo, bar } from 'foo';
            import * as Foo from 'foo';
            import { baz } from 'foo';
        `,
        {
            output: {
                code: `
                import { foo, bar, baz } from 'foo';
                import * as Foo from 'foo';
                `,
            },
        }
    );
});
