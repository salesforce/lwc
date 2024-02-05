/*
 * Copyright (c) 2023, Salesforce.com, inc.
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
    SYNTHETIC_SHADOW_ENABLED,
    ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL,
    ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION,
    NODE_ENV_FOR_TEST,
    API_VERSION,
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
        window.lwcRuntimeFlags = {
            ENABLE_FORCE_NATIVE_SHADOW_MODE_FOR_TEST: ${FORCE_NATIVE_SHADOW_MODE_FOR_TEST},
        };
        window.process = {
            env: {
                NODE_ENV: ${JSON.stringify(NODE_ENV_FOR_TEST || 'development')},
                MIXED_SHADOW: ${FORCE_NATIVE_SHADOW_MODE_FOR_TEST},
                NATIVE_SHADOW: ${!SYNTHETIC_SHADOW_ENABLED || FORCE_NATIVE_SHADOW_MODE_FOR_TEST},
                NATIVE_SHADOW_ROOT_DEFINED: typeof ShadowRoot !== 'undefined',
                SYNTHETIC_SHADOW_ENABLED: ${SYNTHETIC_SHADOW_ENABLED},
                ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL: ${ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL},
                ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION: ${ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION},
                LWC_VERSION: ${JSON.stringify(LWC_VERSION)},
                API_VERSION: ${JSON.stringify(API_VERSION)}
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
