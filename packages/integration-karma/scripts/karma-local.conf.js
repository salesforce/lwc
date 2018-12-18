/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');

const CONFIG_FILENAME = 'config.json';
const BASE_DIR = path.resolve(__dirname, '../dist');

const LWC_ENGINE = require.resolve('@lwc/engine/dist/umd/es2017/engine.js');
const LWC_ENGINE_COMPAT = require.resolve('@lwc/engine/dist/umd/es5/engine.js');

const POLYFILL_COMPAT = require.resolve('es5-proxy-compat/polyfills.js');

function createPattern(location) {
    return {
        pattern: location,
    };
}

function loadLwcConfig() {
    const configLocation = path.resolve(BASE_DIR, CONFIG_FILENAME);

    if (!fs.existsSync(configLocation)) {
        console.error(`Test config file is not present. Make sure to build before.`);
        process.emit(1);
    }

    return require(configLocation);
}

/**
 * More details here:
 * https://karma-runner.github.io/3.0/config/configuration-file.html
 */
module.exports = config => {
    const lwcConfig = loadLwcConfig();

    const files = lwcConfig.compat
        ? [createPattern(POLYFILL_COMPAT), createPattern(LWC_ENGINE_COMPAT)]
        : [createPattern(LWC_ENGINE)];

    config.set({
        basePath: BASE_DIR,
        files: [...files, createPattern('**/*.spec.js')],
        frameworks: ['jasmine'],
        lwcConfig,
    });
};
