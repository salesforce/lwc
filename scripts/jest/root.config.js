/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
module.exports = {
    rootDir: '../..',
    projects: ['<rootDir>/packages/@lwc/*'],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 90,
            lines: 90,
        },
    },
};
