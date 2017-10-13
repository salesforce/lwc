const path = require('path');
const typescript = require('rollup-plugin-typescript');
const strip = require('rollup-plugin-strip-caridy-patched');
const uglify = require('rollup-plugin-uglify');

const { version } = require('../package.json');

const entry = path.resolve(__dirname, '../src/framework/main.ts');
const umdDirectory = path.resolve(__dirname, '../dist/umd');
const commonJSDirectory = path.resolve(__dirname, '../dist/commonjs');
const modulesDirectory = path.resolve(__dirname, '../dist/modules');

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

function rollupConfig({ formats, prod, target, proddebug, test }) {
    const plugins = [];

    plugins.push(typescript({
        target: target,
        typescript: require('typescript'),
    }));

    const functionsToStrip = [];

    if (prod || proddebug || test) {
        // Strip only console.log and not the entire console, because some assert APIs
        // relies on console.warn and console.error
        functionsToStrip.push('console.log');
    }

    if (prod || proddebug) {
        functionsToStrip.push('assert.*');
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
        const targetDirectory = format === 'umd' ? umdDirectory : format === 'es' ? modulesDirectory : commonJSDirectory;

        const targetName = [
            'engine',
            test ? '_test' : '',
            target === 'es5' ? '_compat' : '',
            proddebug ? '_debug' : '',
            prod ? '.min' : '',
            '.js'
        ].join('');

        return { format, dest: path.join(targetDirectory,  targetName) }
    });

    return Object.assign({}, baseRollupConfig, {
        targets,
        plugins
    });
}

module.exports = [
    // DEV mode
    rollupConfig({ formats: ['umd', 'cjs', 'es'], target: 'es2015' }),
    rollupConfig({ formats: ['umd'], target: 'es5' }),

    // PRODDEBUG mode
    rollupConfig({ formats: ['umd'], proddebug: true, target: 'es2015' }),
    rollupConfig({ formats: ['umd'], proddebug: true, target: 'es5' }),

    // PROD mode
    rollupConfig({ formats: ['umd'], prod: true, target: 'es2015' }),
    rollupConfig({ formats: ['umd'], prod: true, target: 'es5' }),

    // TEST mode
    // TODO: Remove this mode once the engine is less chatty by deafault. (W-3908810)
    rollupConfig({ formats: ['cjs'], test: true, target: 'es2015' }),
    rollupConfig({ formats: ['cjs'], test: true, target: 'es5' }),
];
