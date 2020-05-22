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

    pluginTest(
        'should support importing names and default',
        `
            import buzz, { foo, bar } from 'foo';
            import * as Foo from 'foo';
            import { baz } from 'foo';
        `,
        {
            output: {
                code: `
                import buzz, { foo, bar, baz } from 'foo';
                import * as Foo from 'foo';
                `,
            },
        }
    );

    pluginTest(
        'should support importing names and default',

        `   import { baz } from 'foo';
            import buzz, { foo, bar } from 'foo';
            import * as Foo from 'foo';

        `,
        {
            output: {
                code: `
                import buzz, { baz, foo, bar } from 'foo';
                import * as Foo from 'foo';
                `,
            },
        }
    );

    pluginTest(
        'should handle both default and importing the entire contents for a module',
        `
            import defaultExport, * as name from 'foo';
            import { baz } from 'foo';
        `,
        {
            output: {
                code: `
                import defaultExport, * as name from 'foo';
                import { baz } from 'foo';
                `,
            },
        }
    );

    pluginTest(
        'should handle multiple defaults of the same export',
        `
            import defaultExport1, * as name from 'foo';
            import defaultExport2, { foo } from 'foo';
            import { bar as bar2 } from 'foo';
        `,
        {
            output: {
                code: `
                import defaultExport1, * as name from 'foo';
                import defaultExport2, { foo, bar as bar2 } from 'foo';
                `,
            },
        }
    );

    pluginTest(
        'should handle an alias of an export',
        `
            import { foo, bar as baz } from 'foo';
            import defaultExport, * as name from 'foo';
            import { bif } from 'foo';
        `,
        {
            output: {
                code: `
                import { foo, bar as baz, bif } from 'foo';
                import defaultExport, * as name from 'foo';
                `,
            },
        }
    );

    pluginTest(
        'should handle multiple aliases of the same export',
        `
            import { foo, bar as bar1 } from 'foo';
            import { bar as bar2 } from 'foo';
        `,
        {
            output: {
                code: `
                import { foo, bar as bar1, bar as bar2 } from 'foo';
                `,
            },
        }
    );
});
