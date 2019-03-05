/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const {
    LWC_PACKAGE_EXPORTS: { API_DECORATOR },
} = require('../../constants');

function isApiDecorator(decorator) {
    return decorator.name === API_DECORATOR;
}

module.exports = {
    isApiDecorator,
};
