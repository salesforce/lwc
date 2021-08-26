/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

module.exports = {
    rules: {
        'no-extend-global-constructor': require('./rules/no-extend-global-constructor'),
        'no-global-node': require('./rules/no-global-node'),
        'no-invalid-todo': require('./rules/no-invalid-todo'),
        'no-production-assert': require('./rules/no-production-assert'),
    },
};
