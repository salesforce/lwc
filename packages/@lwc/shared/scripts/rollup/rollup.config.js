/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const replace = require('@rollup/plugin-replace');
const typescript = require('../../../../../scripts/rollup/typescript');
const writeDistAndTypes = require('../../../../../scripts/rollup/writeDistAndTypes');
const { version } = require('../../package.json');
const entry = path.resolve(__dirname, '../../src/index.ts');
const banner = `/**\n * Copyright (C) 2018 salesforce.com, inc.\n */`;
const footer = `/** version: ${version} */`;

function generateTargetName({ format }) {
    return ['index', format === 'cjs' ? '.cjs' : '', '.js'].join('');
}

function rollupConfig({ format }) {
    return {
        input: entry,
        output: {
            file: generateTargetName({ format }),
            format,
            banner,
            footer,
        },
        plugins: [
            replace({
                preventAssignment: true,
                'process.env.LWC_VERSION': JSON.stringify(version),
            }),
            typescript(),
            writeDistAndTypes(),
        ],
    };
}

module.exports = [rollupConfig({ format: 'es' }), rollupConfig({ format: 'cjs' })];
