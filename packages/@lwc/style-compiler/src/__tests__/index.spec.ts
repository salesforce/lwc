/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import fs from 'fs';
import path from 'path';

import { testFixtureDir } from '@lwc/internal-jest-utils';

import { transform } from '../index';

function normalizeError(err) {
    if (err.name === 'CssSyntaxError') {
        return {
            name: err.name,
            reason: err.reason,
            column: err.column,
            line: err.line,
        };
    } else {
        return {
            name: err.name,
            message: err.message,
        };
    }
}

describe('fixtures', () => {
    testFixtureDir(
        {
            root: path.resolve(__dirname, 'fixtures'),
            pattern: '**/actual.css',
        },
        ({ src, filename, dirname }) => {
            const configPath = path.resolve(dirname, 'config.json');

            let config: any = {};
            if (fs.existsSync(configPath)) {
                config = require(configPath);
            }

            let result;
            let error;

            try {
                result = transform(src, filename, config);
            } catch (err) {
                error = JSON.stringify(normalizeError(err), null, 4);
            }

            return {
                'expected.js': result?.code,
                'error.json': error,
            };
        }
    );
});
