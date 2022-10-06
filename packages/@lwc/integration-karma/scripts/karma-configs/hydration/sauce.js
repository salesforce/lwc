/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const { getSauceConfig } = require('../utils');
const localConfig = require('./base');

const TAGS = ['hydration'];
const SUITE_NAME = 'integration-karma-hydration';

const SAUCE_BROWSERS = [
    // Standard browsers
    {
        label: 'sl_chrome_latest',
        browserName: 'chrome',
        browserVersion: 'latest',
    },
    // TODO [#3083]: Update to latest firefox and geckodriver.
    // Pin firefox version to 105 and geckodriver to 0.30.0 for now because of
    // issues running the latest version of firefox with geckodriver > 0.30.0
    // in saucelabs.
    // https://saucelabs.com/blog/update-firefox-tests-before-oct-4-2022
    {
        label: 'sl_firefox_latest',
        browserName: 'firefox',
        browserVersion: '105',
        sauceOptions: {
            geckodriverVersion: '0.30.0',
        },
    },
    {
        label: 'sl_safari_latest',
        browserName: 'safari',
        browserVersion: 'latest',
        platformName: 'macOS 12',
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
