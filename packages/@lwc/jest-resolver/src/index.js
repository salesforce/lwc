/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const fs = require('fs');
const { resolve, extname, join, dirname, basename } = require('path');
const lwcNpmResolver = require('@lwc/module-resolver');

/*
 * In Jest version 24 the default resolver was renamed to camelCase. Temporarily
 * support both file names until consumers upgrade their Jest version.
 *
 * Jest master branch has the default resolver passed as a param to custom
 * resolvers like this. Once that is released we can remove this entire block.
 * https://github.com/facebook/jest/commit/3f4661f141562aeca65cdad3802e930835dcf0d9
 */
let resolver;
try {
    resolver = require('jest-resolve/build/default_resolver').default;
} catch (e) {
    resolver = require('jest-resolve/build/defaultResolver').default;
}

const EMPTY_CSS_MOCK = resolve(__dirname, '..', 'resources', 'emptyStyleMock.js');
const EMPTY_HTML_MOCK = resolve(__dirname, '..', 'resources', 'emptyHtmlMock.js');

const WHITELISTED_LWC_PACKAGES = {
    lwc: '@lwc/engine',
    'wire-service': '@lwc/wire-service',
    'wire-service-jest-util': 'lwc-wire-service-jest-util',
};

const lwcMap = lwcNpmResolver.resolveLwcNpmModules();

// This logic is somewhat the same in the compiler resolution system
// We should try to consolidate it at some point.
function isImplicitHTMLImport(importee, { basedir }) {
    const ext = extname(importee);
    const isHTML = ext === '.html';
    const fileName = basename(importee, '.html');
    const absPath = resolve(basedir, importee);
    const jsFile = join(dirname(absPath), fileName + '.js');

    return (
        isHTML && // if is an HTML file
        fs.existsSync(jsFile) && // There must be a js file with the same name in the same folder
        !fs.existsSync(absPath) // and the html must not exist
    );
}

function getLwcPath(path, options) {
    // If is a special LWC package, resolve it from commonjs
    if (WHITELISTED_LWC_PACKAGES[path]) {
        return require.resolve(WHITELISTED_LWC_PACKAGES[path]);
    }

    // If is an LWC module from npm resolve it relative to this folder
    if (lwcMap[path]) {
        return resolve(lwcMap[path].entry);
    }

    // If is a CSS just resolve it to an empty file
    if (extname(path) === '.css') {
        return EMPTY_CSS_MOCK;
    }

    // If is an implicit imported html (auto-binded from the compiler) return an empty file
    if (isImplicitHTMLImport(path, options)) {
        return EMPTY_HTML_MOCK;
    }

    return path;
}

module.exports = function(path, options) {
    return resolver(getLwcPath(path, options), options);
};
