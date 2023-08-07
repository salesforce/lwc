/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import fs from 'fs';
import path from 'path';
import { LWC_VERSION } from '@lwc/shared';
import prettier from 'prettier';
import { testFixtureDir } from '@lwc/jest-utils-lwc-internals';

import compiler, { Config } from '../index';

describe('fixtures', () => {
    testFixtureDir(
        {
            root: path.resolve(__dirname, 'fixtures'),
            pattern: '**/actual.html',
        },
        ({ src, dirname }) => {
            const configPath = path.resolve(dirname, 'config.json');

            let config: Config = {};
            if (fs.existsSync(configPath)) {
                config = require(configPath);
            }

            const compiled = compiler(src, config);
            const { warnings, root } = compiled;

            // Replace LWC's version with X.X.X so the snapshots don't frequently change
            // String.prototype.replaceAll only available in Node 15+
            const code = compiled.code.replace(
                new RegExp(LWC_VERSION.replace(/\./g, '\\.'), 'g'),
                'X.X.X'
            );

            return {
                'expected.js': prettier.format(code, { parser: 'babel' }),
                'ast.json': JSON.stringify({ root }, null, 4),
                'metadata.json': JSON.stringify({ warnings }, null, 4),
            };
        }
    );
});
