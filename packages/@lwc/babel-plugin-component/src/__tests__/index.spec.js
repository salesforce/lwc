/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const { LWC_VERSION } = require('@lwc/shared');
const { testFixtureDir } = require('@lwc/jest-utils-lwc-internals');
const plugin = require('../index');

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

function transform(source, opts = {}) {
    const testConfig = {
        ...BASE_CONFIG,
        plugins: [[plugin, { ...BASE_OPTS, ...opts }]],
    };

    let { code } = babel.transformSync(source, testConfig);

    // Replace LWC's version with X.X.X so the snapshots don't frequently change
    code = code.replace(new RegExp(LWC_VERSION.replace(/\./g, '\\.'), 'g'), 'X.X.X');

    return code;
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
