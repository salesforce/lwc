/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const fs = require('fs');
const path = require('path');
const { testFixtureDir } = require('jest-utils-lwc-internals');
const transform = require('./utils/test-transform');

function normalizeError(err) {
    if (err.code === 'BABEL_TRANSFORM_ERROR') {
        return {
            // Filter out the filename and the stacktrace, just include the error message
            message: err.message.match(/^.*?\.js: ([^\n]+)/)[1],
            loc: err.loc,
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
            pattern: '**/actual.js',
        },
        ({ src, _filename, dirname }) => {
            const configPath = path.resolve(dirname, 'config.json');

            let config = {};
            if (fs.existsSync(configPath)) {
                config = require(configPath);
            }

            let result;
            let error;

            try {
                result = transform(src, config);
            } catch (err) {
                error = JSON.stringify(normalizeError(err), null, 4);
            }

            return {
                'expected.js': result,
                'error.json': error,
            };
        }
    );
});
