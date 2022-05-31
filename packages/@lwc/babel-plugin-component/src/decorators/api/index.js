/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const {
    LWC_PACKAGE_EXPORTS: { API_DECORATOR },
} = require('../../constants');

const validate = require('./validate');
const transform = require('./transform');

module.exports = {
    name: API_DECORATOR,
    validate,
    transform,
};
