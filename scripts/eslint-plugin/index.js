/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
'use strict';

const noExtendGlobalConstructor = require('./rules/no-extend-global-constructor');
const noProductionAssert = require('./rules/no-production-assert');

module.exports = {
    rules: {
        'no-extend-global-constructor': noExtendGlobalConstructor,
        'no-production-assert': noProductionAssert,
    },
};
