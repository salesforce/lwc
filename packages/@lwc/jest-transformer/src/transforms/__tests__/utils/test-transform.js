/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const babel = require('@babel/core');
const unpad = require('./unpad');

const test = it;

const baseConfig = {
    babelrc: false,
    filename: 'test.js',
    parserOpts: {
        plugins: [
            ['decorators', { decoratorsBeforeExport: true }],
            ['classProperties', {}],
            ['dynamicImport', {}],
        ],
    },
};

function transform(plugin, opts = {}) {
    const testConfig = Object.assign(
        {},
        baseConfig,
        {
            plugins: [plugin],
        },
        opts
    );

    return function(source) {
        return babel.transform(unpad(source), testConfig);
    };
}

function makeTest(plugin, opts = {}) {
    const testTransform = transform(plugin, opts);

    const pluginTest = function(name, source, expectedSource, expectedError) {
        test(name, () => {
            let res;
            let err;

            try {
                res = testTransform(source);
            } catch (error) {
                err = error;
            }

            if (err) {
                if (!expectedError) {
                    throw err;
                }
                expect(err.message).toContain(expectedError);
            } else {
                if (expectedError) {
                    throw new Error('Did not receive expected error: ' + expectedError.message);
                }
                if (expectedSource) {
                    expect(res.code).toBe(unpad(expectedSource));
                }
            }
        });
    };

    // eslint-disable-next-line jest/no-disabled-tests
    pluginTest.skip = name => test.skip(name);

    return pluginTest;
}

module.exports.test = makeTest;
module.exports.transform = transform;
