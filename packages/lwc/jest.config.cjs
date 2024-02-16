/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/* eslint-env node */

/**
 * This is a .cjs file because this package is an ESM package, but jest needs CJS to work.
 * If this file is ever changed to a .js file, add an exclusion to the package.json "files" list,
 * so that this is not shipped as part of the package.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const BASE_CONFIG = require('../../scripts/jest/base.config');

module.exports = {
    ...BASE_CONFIG,
    displayName: 'lwc',
    testEnvironment: 'jsdom',
};
