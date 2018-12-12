/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
module.exports = {
    extends: [
        '@commitlint/config-conventional' // scoped packages are not prefixed
    ],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'release',
                'build',
                'chore',
                'ci',
                'docs',
                'feat',
                'fix',
                'perf',
                'proposal',
                'refactor',
                'revert',
                'style',
                'test',
                'wip'
            ]
        ]
    }
};
