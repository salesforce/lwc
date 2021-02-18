/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const dedupeImports = require('./dedupe-imports');

function exit(api) {
    return {
        Program: {
            exit(path) {
                dedupeImports(api, path);
            },
        },
    };
}

module.exports = { exit };
