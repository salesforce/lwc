/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { transform: postProcess, dedupeImports } = require('./post-process');

function exit(api) {
    return {
        Program: {
            exit(path, state) {
                const visitors = api.traverse.visitors.merge([postProcess(api)]);

                path.traverse(visitors, state);
                dedupeImports(api, path);
            },
        },
    };
}

module.exports = { exit };
