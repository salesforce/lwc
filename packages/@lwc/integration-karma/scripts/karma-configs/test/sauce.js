/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const { STANDARD_SAUCE_BROWSERS, LEGACY_SAUCE_BROWSERS } = require('../shared/browsers');
const { getSauceConfig } = require('../utils');
const { LEGACY_BROWSERS } = require('../../shared/options');

const TAGS = require('./tags');
const localConfig = require('./base');

const SAUCE_BROWSERS = [...(LEGACY_BROWSERS ? LEGACY_SAUCE_BROWSERS : STANDARD_SAUCE_BROWSERS)];

module.exports = (config) => {
    localConfig(config);

    if (SAUCE_BROWSERS.length === 0) {
        throw new Error('No matching browser found for the passed configuration.');
    }

    const sauceConfig = getSauceConfig(config, {
        suiteName: 'integration-karma',
        tags: TAGS,
        browsers: SAUCE_BROWSERS,
    });

    config.set(sauceConfig);
};
