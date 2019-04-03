/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/* eslint eslint-comments/no-use: off */
/* eslint-env node */
const path = require('path');
const replace = require('rollup-plugin-replace');

module.exports = {
    input: path.resolve('playground/app.js'),
    output: {
        file: path.resolve('playground/index.js'),
        format: 'iife',
        name: 'Main',
    },
    plugins: [replace({ 'process.env.NODE_ENV': JSON.stringify('development') })],
};
