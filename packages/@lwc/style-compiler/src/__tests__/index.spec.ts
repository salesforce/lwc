/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import fs from 'fs';
import path from 'path';
import { testFixtureDir } from 'jest-utils-lwc-internals';
import type { CssSyntaxError } from 'postcss';
import { transform, Config } from '../index';

function normalizeError(err: Error) {
    if (err.name === 'CssSyntaxError') {
        return {
            name: err.name,
            reason: (err as CssSyntaxError).reason,
            column: (err as CssSyntaxError).column,
            line: (err as CssSyntaxError).line,
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

            let config: Config = {};
            if (fs.existsSync(configPath)) {
                config = require(configPath);
            }

            let result;
            let error;

            try {
                result = transform(src, filename, config);
            } catch (err: any) {
                error = JSON.stringify(normalizeError(err), null, 4);
            }

            return {
                'expected.js': result?.code,
                'error.json': error,
            };
        }
    );
});
