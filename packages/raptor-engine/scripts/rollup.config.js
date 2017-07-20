const path = require('path');
const typescript = require('rollup-plugin-typescript');
const strip = require('rollup-plugin-strip-caridy-patched');
const uglify = require('rollup-plugin-uglify');

const { version } = require('../package.json');

const entry = path.resolve(__dirname, '../src/framework/main.ts');
const distDirectory = path.resolve(__dirname, '../dist');
const libDirectory = path.resolve(__dirname, '../lib');

const moduleName = 'Engine';

const banner = (
`/*
 * Copyright (C) 2017 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
`
);
const footer = `/** version: ${version} */`;

const baseRollupConfig = {
    entry,
    moduleName,
    banner,
    footer,
};

function rollupConfig({ formats, prod, compat, proddebug }) {
    const plugins = [];

    plugins.push(typescript({
        target: compat ? 'es5' : 'es2015',
        typescript: require('typescript'),
    }));

    const functionsToStrip = [];
    if (!compat) {
        functionsToStrip.push('compat');
    }
    if (prod || proddebug) {
        functionsToStrip.push('console.*', 'assert.*');
    }

    plugins.push(strip({
        functions: functionsToStrip,
        include   : '**/*.ts',
    }))

    if (prod) {
        const { minify } = require('uglify-es');
        plugins.push(uglify({}, code => minify(code)));
    }

    const targets = formats.map(format => {
        const isDist = format === 'umd';
        const targetDirectory = isDist ? distDirectory : libDirectory;

        let formatSuffix = '';
        if (format === 'cjs') {
            formatSuffix = '.common'
        } else if (format === 'es') {
            formatSuffix = '.es'
        }

        const targetName = [
            'engine',
            compat ? '_compat' : '',
            formatSuffix,
            proddebug ? '_debug' : '',
            prod ? '.min' : '',
            '.js'
        ].join('');

        return {
            format,
            dest: path.join(targetDirectory, targetName),
        }
    });

    return Object.assign({}, baseRollupConfig, {
        targets,
        plugins
    });
}

module.exports = [

    // DEV mode
    rollupConfig({ formats: ['umd', 'cjs', 'es'], compat: false }),
    rollupConfig({ formats: ['umd', 'cjs', 'es'], compat: true }),

    // PRODDEBUG mode
    rollupConfig({ formats: ['umd'], proddebug: true, compat: false }),
    rollupConfig({ formats: ['umd'], proddebug: true, compat: true }),

    // PROD mode
    rollupConfig({ formats: ['umd'], prod: true, compat: false }),
    rollupConfig({ formats: ['umd'], prod: true, compat: true }),
];
