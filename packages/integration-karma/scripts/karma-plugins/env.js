/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * This Karma plugin injects environment variable to configure the application and the test properly. As temporary
 * script is generated based the config, and served as the first file Karma should run.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const {
    COMPAT,
    FORCE_NATIVE_SHADOW_MODE_FOR_TEST,
    SYNTHETIC_SHADOW_ENABLED,
} = require('../shared/options');

const DIST_DIR = path.resolve(__dirname, '../../dist');
const ENV_FILENAME = path.resolve(DIST_DIR, 'env.js');

function createEnvFile() {
    if (!fs.existsSync(DIST_DIR)) {
        fs.mkdirSync(DIST_DIR);
    }

    fs.writeFileSync(
        ENV_FILENAME,
        `
        window.process = {
            env: {
                NODE_ENV: 'development',
                COMPAT: ${COMPAT},
                NATIVE_SHADOW: ${!SYNTHETIC_SHADOW_ENABLED || FORCE_NATIVE_SHADOW_MODE_FOR_TEST},
                NATIVE_SHADOW_ROOT_DEFINED: typeof ShadowRoot !== 'undefined'
            }
        };
    `
    );
}

function initEnv(files) {
    createEnvFile();
    files.unshift({
        pattern: ENV_FILENAME,
    });
}

initEnv.$inject = ['config.files'];

module.exports = {
    'framework:env': ['factory', initEnv],
};
