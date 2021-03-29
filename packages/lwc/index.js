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

function getVersion() {
    const pkgPath = path.join(__dirname, './package.json');
    const pkgSrc = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(pkgSrc);
    return pkg.version;
}

const MODULES = new Set(['engine-dom', 'engine-server', 'synthetic-shadow', 'wire-service']);
const FORMATS = new Set(['iife', 'umd', 'esm']);
const TARGETS = new Set(['es5', 'es2017']);
const MODES = new Set(['dev', 'prod', 'prod_debug']);

const DEFAULT_FORMAT = 'esm';
const DEFAULT_TARGET = 'es2017';
const DEFAULT_MODE = 'dev';

function validateArgs(name, format, target, mode) {
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

    if (!MODES.has(mode)) {
        throw new Error(`Invalid mode "${mode}". Available modes: ${Array.from(MODES.keys())}`);
    }
}

function getModule(name, format = DEFAULT_FORMAT, target = DEFAULT_TARGET, mode = DEFAULT_MODE) {
    const distPath = getModulePath(name, format, target, mode);
    return fs.readFileSync(distPath, 'utf8');
}

function getModulePath(
    name,
    format = DEFAULT_FORMAT,
    target = DEFAULT_TARGET,
    mode = DEFAULT_MODE
) {
    validateArgs(name, format, target, mode);
    let distPath;
    // The default is on the package itself (naming convention is set)
    if (format === DEFAULT_FORMAT && target === DEFAULT_TARGET && mode === DEFAULT_MODE) {
        distPath = require.resolve(`@lwc/${name}/dist/${name}.js`);

        // Otherwise is on dist of this package
    } else if (mode === 'prod') {
        distPath = path.join(__dirname, 'dist', name, format, target, `${name}${PROD_SUFFIX}.js`);
    } else if (mode === 'prod_debug') {
        distPath = path.join(__dirname, 'dist', name, format, target, `${name}${DEBUG_SUFFIX}.js`);
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
    getModule,
    getModulePath,
};
