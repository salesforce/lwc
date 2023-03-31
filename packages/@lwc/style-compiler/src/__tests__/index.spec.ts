/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import fs from 'fs';
import path from 'path';
import { testFixtureDir } from '@lwc/jest-utils-lwc-internals';
import { LWC_VERSION } from '@lwc/shared';

import { transform, Config } from '../index';

import type { CssSyntaxError } from 'postcss';

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

            // Replace LWC's version with X.X.X so the snapshots don't frequently change
            let code = result?.code;
            if (code) {
                code = code.replace(new RegExp(LWC_VERSION.replace(/\./g, '\\.'), 'g'), 'X.X.X');
            }

            return {
                'expected.js': code,
                'error.json': error,
            };
        }
    );
});
