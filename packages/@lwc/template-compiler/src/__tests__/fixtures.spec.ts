/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'node:path';
import { describe } from 'vitest';
import { LWC_VERSION } from '@lwc/shared/language';
import prettier from 'prettier';
import { testFixtureDir } from '@lwc/test-utils-lwc-internals';

import compiler from '../index';

describe('fixtures', () => {
    testFixtureDir(
        {
            root: path.resolve(__dirname, 'fixtures'),
            pattern: '**/actual.html',
        },
        async ({ src, dirname, config }) => {
            const filename = path.basename(dirname);

            config = { namespace: 'x', name: filename, ...config };

            const compiled = compiler(src, filename, config);
            const { warnings, root } = compiled;

            // Replace LWC's version with X.X.X so the snapshots don't frequently change
            // String.prototype.replaceAll only available in Node 15+
            const code = compiled.code.replace(
                new RegExp(LWC_VERSION.replace(/\./g, '\\.'), 'g'),
                'X.X.X'
            );

            return {
                'expected.js': await prettier.format(code, {
                    parser: 'babel',
                    trailingComma: 'es5',
                }),
                'ast.json': JSON.stringify({ root }, null, 4),
                'metadata.json': JSON.stringify({ warnings }, null, 4),
            };
        }
    );
});
