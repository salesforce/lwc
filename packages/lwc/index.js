/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const fs = require('fs');
const path = require('path');

function getVersion() {
    const pkgPath = path.join(__dirname, './package.json');
    const pkgSrc = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(pkgSrc);
    return pkg.version;
}

const MODULES = new Set(['engine-dom', 'engine-server', 'synthetic-shadow', 'wire-service']);
const FORMATS = new Set(['iife', 'umd', 'esm']);
const TARGETS = new Set(['es5', 'es2017']);

const DEFAULT_FORMAT = 'esm';
const DEFAULT_TARGET = 'es2017';

function validateArgs(name, format, target) {
    if (!MODULES.has(name)) {
        throw new Error(
            `Invalid module name "${name}". Available module names: ${Array.from(MODULES.keys())}`
        );
    }

    if (!FORMATS.has(format)) {
        throw new Error(
            `Invalid format "${name}". Available formats: ${Array.from(FORMATS.keys())}`
        );
    }

    if (!TARGETS.has(target)) {
        throw new Error(
            `Invalid target "${target}". Available targets: ${Array.from(TARGETS.keys())}`
        );
    }
}

function getModulePath(name, format = DEFAULT_FORMAT, target = DEFAULT_TARGET) {
    validateArgs(name, format, target);
    let distPath;
    // The default is on the package itself (naming convention is set)
    if (format === DEFAULT_FORMAT && target === DEFAULT_TARGET) {
        distPath = require.resolve(`@lwc/${name}/dist/${name}.js`);
    } else {
        distPath = path.join(__dirname, 'dist', name, format, target, `${name}.js`);
    }

    if (!fs.existsSync(distPath)) {
        throw new Error(`Module path "${distPath}" for module ${name} not found`);
    }

    return distPath;
}

module.exports = {
    getVersion,
    getModulePath,
};
