/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import fs from 'node:fs';
import path from 'node:path';
import { transformSync } from '@babel/core';
import { LWC_VERSION, HIGHEST_API_VERSION } from '@lwc/shared';
import { testFixtureDir } from '@lwc/jest-utils-lwc-internals';
import plugin from '../index';

const BASE_OPTS = {
    namespace: 'lwc',
    name: 'test',
};

const BASE_CONFIG = {
    babelrc: false,
    configFile: false,
    filename: `${BASE_OPTS.name}.js`,
    // Force Babel to generate new line and white spaces. This prevent Babel from generating
    // an error when the generated code is over 500KB.
    compact: false,
};

function normalizeError(err: any) {
    if (err.code === 'BABEL_TRANSFORM_ERROR') {
        return {
            // Filter out the stacktrace, just include the error message
            message: err.message.match(/^.*?\.js: ([^\n]+)/)[1],
            loc: err.loc,
            filename: err.filename ? path.basename(err.filename) : undefined,
        };
    } else {
        return {
            name: err.name,
            message: err.message,
        };
    }
}

function transform(source: string, opts = {}) {
    const testConfig = {
        ...BASE_CONFIG,
        plugins: [[plugin, { ...BASE_OPTS, ...opts }]],
    };

    let { code } = transformSync(source, testConfig)!;

    // Replace LWC's version with X.X.X so the snapshots don't frequently change
    code = code!.replace(new RegExp(LWC_VERSION.replace(/\./g, '\\.'), 'g'), 'X.X.X');

    // Replace the latest API version as well
    code = code.replace(
        new RegExp(`apiVersion: ${HIGHEST_API_VERSION}`, 'g'),
        `apiVersion: 9999999`
    );

    return code;
}

describe('fixtures', () => {
    testFixtureDir(
        {
            root: path.resolve(__dirname, 'fixtures'),
            pattern: '**/actual.js',
        },
        ({ src, dirname }) => {
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
