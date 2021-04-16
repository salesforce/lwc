/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import fs from 'fs';
import path from 'path';

import prettier from 'prettier';
import { testFixtureDir } from '@lwc/internal-jest-utils';

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

            const { code, warnings } = compiler(src, config);

            return {
                'expected.js': prettier.format(code, { parser: 'babel' }),
                'metadata.json': JSON.stringify({ warnings }, null, 4),
            };
        }
    );
});
