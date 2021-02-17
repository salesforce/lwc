/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const transform = require('./transform');
const dedupeImports = require('./dedupe-imports');

function exit(api) {
    return {
        Program: {
            exit(path, state) {
                path.traverse(transform(api), state);
                dedupeImports(api, path);
            },
        },
    };
}

module.exports = { exit };
