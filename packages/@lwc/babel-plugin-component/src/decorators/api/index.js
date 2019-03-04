/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const validate = require('./validate');
const transform = require('./transform');
const {
    LWC_PACKAGE_EXPORTS: { API_DECORATOR },
} = require('../../constants');

module.exports = {
    name: API_DECORATOR,
    validate,
    transform,
};
