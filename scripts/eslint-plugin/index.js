/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

module.exports = {
    rules: {
        'no-global-node': require('./rules/no-global-node'),
        'no-invalid-todo': require('./rules/no-invalid-todo'),
    },
};
