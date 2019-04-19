/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const crypto = require('crypto');

const babelCore = require('@babel/core');
const lwcCompiler = require('@lwc/compiler');
const jestPreset = require('babel-preset-jest');
const babelCommonJs = require('@babel/plugin-transform-modules-commonjs');

const engineVersion = require('@lwc/engine/package.json').version;
const compilerVersion = require('@lwc/compiler/package.json').version;

const apexScopedImport = require('./transforms/apex-scoped-import');
const apexContinuationScopedImport = require('./transforms/apex-continuation-scoped-import');
const i18nScopedImport = require('./transforms/i18n-scoped-import');
const labelScopedImport = require('./transforms/label-scoped-import');
const resourceScopedImport = require('./transforms/resource-scoped-import');
const contentAssetUrlScopedImport = require('./transforms/content-asset-url-scoped-import');
const schemaScopedImport = require('./transforms/schema-scoped-import');
const userScopedImport = require('./transforms/user-scoped-import');

const BABEL_CONFIG = {
    sourceMaps: 'both',
    presets: [jestPreset],
    plugins: [
        babelCommonJs,
        apexScopedImport,
        apexContinuationScopedImport,
        i18nScopedImport,
        labelScopedImport,
        contentAssetUrlScopedImport,
        resourceScopedImport,
        schemaScopedImport,
        userScopedImport,
    ],
};

module.exports = {
    process(src, filePath) {
        // Set default module name and namespace value for the namespace because it can't be properly guessed from the path
        const { code, map } = lwcCompiler.transformSync(src, filePath, {
            moduleName: 'test',
            moduleNamespace: 'x',
            outputConfig: {
                sourcemap: true,
            },
        });

        // if is not .js, we add the .compiled extension in the sourcemap
        const filename = path.extname(filePath) === '.js' ? filePath : filePath + '.compiled';
        // **Note: .html and .css don't return valid sourcemaps cause they are used for rollup
        const config = map && map.version ? { inputSourceMap: map } : {};

        return babelCore.transform(code, { ...BABEL_CONFIG, ...config, filename });
    },
    getCacheKey(fileData, filePath, configStr, options) {
        const { NODE_ENV } = process.env;
        return crypto
            .createHash('md5')
            .update(JSON.stringify(options), 'utf8')
            .update(
                fileData + filePath + configStr + NODE_ENV + compilerVersion + engineVersion,
                'utf8'
            )
            .digest('hex');
    },
};
