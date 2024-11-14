/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import path from 'node:path';
import { describe } from 'vitest';
import { LWC_VERSION } from '@lwc/shared';
import prettier from 'prettier';
import { testFixtureDir } from '@lwc/test-utils-lwc-internals';

import compiler from '../index';

describe('fixtures', () => {
    testFixtureDir(
        {
            root: path.resolve(__dirname, 'fixtures'),
            pattern: '**/actual.html',
        },
        ({ src, dirname, config }) => {
            const filename = path.basename(dirname);
            return compiler(src, filename, { namespace: 'x', name: filename, ...config });
        },
        {
            'expected.js': ({ code }) =>
                prettier.format(
                    code.replace(new RegExp(LWC_VERSION.replace(/\./g, '\\.'), 'g'), 'X.X.X'),
                    {
                        parser: 'babel',
                        trailingComma: 'es5',
                    }
                ),
            'ast.json': ({ root }) => JSON.stringify({ root }, null, 4),
            'metadata.json': ({ warnings }) => JSON.stringify({ warnings }, null, 4),
        }
    );
});
