/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const localConfig = require('./base');
const { getSauceConfig } = require('../utils');
const TAGS = ['hydration'];
const SUITE_NAME = 'integration-karma-hydration';

const SAUCE_BROWSERS = [
    // Standard browsers
    {
        label: 'sl_chrome_latest',
        browserName: 'chrome',
        version: 'latest',
    },
    {
        label: 'sl_firefox_latest',
        browserName: 'firefox',
        version: 'latest',
    },
    {
        label: 'sl_safari_latest',
        browserName: 'safari',
        version: 'latest',
    },
];

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
