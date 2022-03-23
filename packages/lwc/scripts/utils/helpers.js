/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const fs = require('fs');
const path = require('path');

function createDir(dir) {
    return !fs.existsSync(dir) && fs.mkdirSync(dir);
}

function getEs6ModuleEntry(pkg) {
    const pkgFilePath = require.resolve(`${pkg}/package.json`);
    const pkgDir = path.dirname(pkgFilePath);
    const pkgJson = JSON.parse(fs.readFileSync(pkgFilePath, 'utf8'));
    return path.join(pkgDir, pkgJson.module);
}

function ignoreCircularDependencies({ code, message }) {
    if (code !== 'CIRCULAR_DEPENDENCY') {
        throw new Error(message);
    }
}

function buildBundleConfig(defaultConfig, { format, target }) {
    return {
        ...defaultConfig,
        targetDirectory: path.join(defaultConfig.dir, format),
        format,
        target,
    };
}

module.exports = {
    ignoreCircularDependencies,
    createDir,
    getEs6ModuleEntry,
    buildBundleConfig,
};
