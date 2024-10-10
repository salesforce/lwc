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

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LWC_VERSION } from '@lwc/shared';
import options from '../shared/options';
import type { GlobalSetupContext } from 'vitest/node';

const {
    FORCE_NATIVE_SHADOW_MODE_FOR_TEST,
    ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL,
    ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION,
    NODE_ENV_FOR_TEST,
    API_VERSION,
    DISABLE_SYNTHETIC,
    DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE,
    DISABLE_STATIC_CONTENT_OPTIMIZATION,
} = options;

const DIST_DIR = resolve(__dirname, '../../dist');
const ENV_FILENAME = resolve(DIST_DIR, 'env.js');

function createEnvFile() {
    if (!existsSync(DIST_DIR)) {
        mkdirSync(DIST_DIR);
    }

    writeFileSync(
        ENV_FILENAME,
        `
        globalThis.process = {
            env: {
                API_VERSION: ${JSON.stringify(API_VERSION)},
                DISABLE_STATIC_CONTENT_OPTIMIZATION: ${DISABLE_STATIC_CONTENT_OPTIMIZATION},
                ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL: ${ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL},
                ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION: ${ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION},
                FORCE_NATIVE_SHADOW_MODE_FOR_TEST: ${FORCE_NATIVE_SHADOW_MODE_FOR_TEST},
                LWC_VERSION: ${JSON.stringify(LWC_VERSION)},
                NATIVE_SHADOW: ${DISABLE_SYNTHETIC || FORCE_NATIVE_SHADOW_MODE_FOR_TEST},
                NODE_ENV: ${JSON.stringify(NODE_ENV_FOR_TEST || 'development')},
            }
        };
        globalThis.lwcRuntimeFlags = {
          DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE: ${DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE}
        };
    `
    );
}

function initEnv(files: { pattern: string }[]) {
    createEnvFile();
    files.unshift({
        pattern: ENV_FILENAME,
    });
}

export default function setup(_context: GlobalSetupContext) {
    initEnv([]);
}

//   declare module 'vitest' {
//     export interface ProvidedContext {
//       wsPort: number
//     }
//   }

// initEnv.$inject = ['config.files'];

// export default {
//     'framework:env': ['factory', initEnv],
// };
