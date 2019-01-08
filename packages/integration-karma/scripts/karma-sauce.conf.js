/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const localConfig = require('./karma-local.conf');

const sauceBrowsers = {
    standard: {
        sl_chrome_latest: {
            base: 'SauceLabs',
            browserName: 'chrome',
            version: 'latest',
        },
        sl_firefox_latest: {
            base: 'SauceLabs',
            browserName: 'firefox',
            version: 'latest',
        },
        sl_safari_latest: {
            base: 'SauceLabs',
            browserName: 'safari',
            platform: 'OS X 10.12',
        },
    },
    compat: {
        sl_ie11: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            version: '11.0',
        },
        sl_chrome_compat: {
            base: 'SauceLabs',
            browserName: 'chrome',
            version: '59',
        },
        sl_firefox_compat: {
            base: 'SauceLabs',
            browserName: 'firefox',
            version: '54',
        },
        sl_safari_compat: {
            base: 'SauceLabs',
            browserName: 'safari',
            platform: 'OS X 10.11',
            version: '10',
        },
    },
};

module.exports = config => {
    const username = process.env.SAUCE_USERNAME;
    if (!username) {
        throw new TypeError('Missing SAUCE_USERNAME environment variable');
    }

    const accessKey = process.env.SAUCE_ACCESS_KEY || process.env.SAUCE_KEY;
    if (!accessKey) {
        throw new TypeError(
            'Missing SAUCE_ACCESS_KEY or SAUCE_KEY environment variable',
        );
    }

    localConfig(config);

    const { compat } = config.lwcConfig;

    const customLaunchers = compat
        ? sauceBrowsers.compat
        : sauceBrowsers.standard;

    config.set({
        sauceLabs: {
            username,
            accessKey,

            testName: `LWC integration test - ${
                compat ? 'COMPAT' : 'STANDARD'
            } mode`,
            recordScreenshots: false,

            customData: {
                compat,

                ci: !!process.env.CI,
                build: process.env.CIRCLE_BUILD_NUM || Date.now(),

                commit: process.env.CIRCLE_SHA1,
                branch: process.env.CIRCLE_BRANCH,
                buildUrl: process.env.CIRCLE_BUILD_URL,
            },
        },

        customLaunchers,
        browsers: Object.keys(customLaunchers),

        // avoid spamming CI output
        reporters: process.env.CI
            ? ['dots', 'saucelabs', 'coverage']
            : ['progress', 'saucelabs', 'coverage'],

        plugins: [
            ...config.plugins,
            'karma-sauce-launcher'
        ],

        // Force Karma to run in singleRun mode in order to shutdown the server after the tests finished to run.
        singleRun: true,
    });
};
