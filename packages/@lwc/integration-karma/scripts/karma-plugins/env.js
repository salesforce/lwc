/*
 * Copyright (c) 2024, Salesforce, Inc.
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
const { LWC_VERSION } = require('@lwc/shared');
const {
    FORCE_NATIVE_SHADOW_MODE_FOR_TEST,
    ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL,
    ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION,
    NODE_ENV_FOR_TEST,
    API_VERSION,
    DISABLE_SYNTHETIC,
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
                API_VERSION: ${JSON.stringify(API_VERSION)},
                ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL: ${ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL},
                ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION: ${ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION},
                FORCE_NATIVE_SHADOW_MODE_FOR_TEST: ${FORCE_NATIVE_SHADOW_MODE_FOR_TEST},
                LWC_VERSION: ${JSON.stringify(LWC_VERSION)},
                NATIVE_SHADOW: ${DISABLE_SYNTHETIC || FORCE_NATIVE_SHADOW_MODE_FOR_TEST},
                NODE_ENV: ${JSON.stringify(NODE_ENV_FOR_TEST || 'development')},
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
