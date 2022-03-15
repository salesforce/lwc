/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const babel = require('@babel/core');
const { LWC_VERSION } = require('@lwc/shared');
const plugin = require('../../index.js');
const BASE_CONFIG = {
    babelrc: false,
    configFile: false,
    filename: 'test.js',
    // Force Babel to generate new line and whitespaces. This prevent Babel from generating
    // an error when the generated code is over 500KB.
    compact: false,
};

module.exports = function transform(source, opts = {}) {
    const testConfig = {
        ...BASE_CONFIG,
        plugins: [[plugin, opts]],
    };

    let { code } = babel.transformSync(source, testConfig);

    // Replace LWC's version with X.X.X so the snapshots don't frequently change
    code = code.replace(new RegExp(LWC_VERSION.replace(/\./g, '\\.'), 'g'), 'X.X.X');

    return code;
};
