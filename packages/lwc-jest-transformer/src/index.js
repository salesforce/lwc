const babelCore = require('@babel/core');
const babelCommonJs = require('@babel/plugin-transform-modules-commonjs');
const jestPreset = require('babel-preset-jest');
const lwcCompiler = require('lwc-compiler');
const crypto = require('crypto');
const engineVersion = require('lwc-engine/package.json').version;
const compilerVersion = require('lwc-compiler/package.json').version;
const { waitForPromise } = require('./utils');
const labelSchemaImport = require('./transforms/label-schema-import');
const resourceSchemaImport = require('./transforms/resource-schema-import');

const BABEL_CONFIG = {
    "presets": [
        jestPreset,
    ],
    "plugins": [
        babelCommonJs,
        labelSchemaImport,
        resourceSchemaImport,
    ]
};

module.exports = {
    process(src, filePath) {
        // Set default module name and namespace value for the namespace because it can't be properly guessed from the path
        const transform = lwcCompiler.transform(src, filePath, {
            moduleName: 'test',
            moduleNamespace: 'x'
        });

        const { code } = waitForPromise(transform);

        const generated = babelCore.transform(code, BABEL_CONFIG);

        return generated.code;
    },
    getCacheKey(fileData, filePath, configStr, options) {
        const { NODE_ENV } = process.env;
        return crypto
            .createHash('md5')
            .update(JSON.stringify(options), 'utf8')
            .update(fileData + filePath + configStr + NODE_ENV + compilerVersion + engineVersion, 'utf8')
            .digest('hex');
    }
};
