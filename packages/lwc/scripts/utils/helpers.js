/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const fs = require('fs');
const path = require('path');

const DEBUG_SUFFIX = '_debug';
const PROD_SUFFIX = '.min';

function createDir(dir) {
    return !fs.existsSync(dir) && fs.mkdirSync(dir);
}

function getEs6ModuleEntry(pkg) {
    const pkgFilePath = path.resolve(__dirname, '../../../', pkg, './package.json');
    const pkgDir = path.dirname(pkgFilePath);
    const pkgJson = JSON.parse(fs.readFileSync(pkgFilePath, 'utf8'));
    return path.join(pkgDir, pkgJson.module);
}

function generateTargetName({ targetName, prod, debug }) {
    return [targetName, debug ? DEBUG_SUFFIX : prod ? '.min' : '', '.js'].join('');
}

function ignoreCircularDependencies({ code, message }) {
    if (code !== 'CIRCULAR_DEPENDENCY') {
        throw new Error(message);
    }
}

function buildBundleConfig(defaultConfig, { format, target, prod, debug }) {
    return {
        ...defaultConfig,
        targetDirectory: path.join(defaultConfig.dir, format),
        format,
        target,
        prod,
        debug,
    };
}

module.exports = {
    DEBUG_SUFFIX,
    PROD_SUFFIX,
    generateTargetName,
    ignoreCircularDependencies,
    createDir,
    getEs6ModuleEntry,
    buildBundleConfig,
};
