/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const { libInstrument } = require('istanbul-api');

// Istanbul instrumenter to adapt the new instrumentation istanbul API with karma-coverage plugin.
class Instrumenter {
    constructor(...args) {
        return libInstrument.createInstrumenter(...args);
    }
}

module.exports = {
    Instrumenter,
};
