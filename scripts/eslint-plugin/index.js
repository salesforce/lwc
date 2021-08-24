/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
'use strict';

const noExtendGlobalConstructor = require('./rules/no-extend-global-constructor');
const noProductionAssert = require('./rules/no-production-assert');
const noInvalidTodo = require('./rules/no-invalid-todo');
const noInstanceofUncachedNode = require('./rules/no-instanceof-uncached-node');

module.exports = {
    rules: {
        'no-extend-global-constructor': noExtendGlobalConstructor,
        'no-instanceof-uncached-node': noInstanceofUncachedNode,
        'no-invalid-todo': noInvalidTodo,
        'no-production-assert': noProductionAssert,
    },
};
