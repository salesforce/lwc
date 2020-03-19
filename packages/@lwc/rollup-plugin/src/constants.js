/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const DEFAULT_MODE = 'dev';
const DEFAULT_OPTIONS = {
    mode: DEFAULT_MODE,
    sourcemap: false,
};

const DEFAULT_MODULES = [
    { npm: '@lwc/engine' },
    { npm: '@lwc/synthetic-shadow' },
    { npm: '@lwc/wire-service' },
];

module.exports = {
    DEFAULT_OPTIONS,
    DEFAULT_MODE,
    DEFAULT_MODULES,
};
