/* eslint-env node */

const path = require('path');
const typescript = require('rollup-plugin-typescript');
const uglify = require('rollup-plugin-uglify');

const { version } = require('./package.json');

const entry = path.resolve(__dirname, 'src/main.ts');
const distDirectory = path.resolve(__dirname, 'dist');
const libDirectory = path.resolve(__dirname, 'lib');

const moduleName = 'Proxy';

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

function rollupConfig({ formats, prod }) {
    const plugins = [];

    plugins.push(typescript({
        typescript: require('typescript'),
    }));

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
            'proxy-compat',
            formatSuffix,
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
    rollupConfig({ formats: ['umd', 'cjs', 'es'] }),
    rollupConfig({ formats: ['umd', 'cjs', 'es'] }),

    // PROD mode
    rollupConfig({ formats: ['umd'], prod: true }),
    rollupConfig({ formats: ['umd'], prod: true }),

];
