/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const { STANDARD_SAUCE_BROWSERS } = require('../shared/browsers');
const { getSauceConfig } = require('../utils');
const localConfig = require('./base');

const TAGS = ['hydration'];
const SUITE_NAME = 'integration-karma-hydration';

const SAUCE_BROWSERS = [...STANDARD_SAUCE_BROWSERS];

module.exports = (config) => {
    localConfig(config);

    const sauceConfig = getSauceConfig(config, {
        suiteName: SUITE_NAME,
        tags: TAGS,
        customData: {
            lwc: {
                HYDRATION: 1,
            },
        },
        browsers: SAUCE_BROWSERS,
    });

    config.set(sauceConfig);
};
