/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const localConfig = require('./karma-local.conf');

const SAUCE_BROWSERS = [
    // Standard browsers
    {
        label: 'sl_chrome_latest',
        browserName: 'chrome',
        version: 'latest',
        compat: false,
        nativeShadowCompatible: true,
    },
    {
        label: 'sl_firefox_latest',
        browserName: 'firefox',
        version: 'latest',
        compat: false,
        nativeShadowCompatible: true,
    },
    {
        label: 'sl_safari_latest',
        browserName: 'safari',
        platform: 'OS X 10.13',
        compat: false,
        nativeShadowCompatible: true,
    },

    // Compat browsers
    {
        label: 'sl_ie11',
        browserName: 'internet explorer',
        version: '11.0',
        compat: true,
        nativeShadowCompatible: false,
    },
    {
        label: 'sl_chrome_compat',
        browserName: 'chrome',
        version: '59',
        compat: true,
        nativeShadowCompatible: false,
    },
    {
        label: 'sl_firefox_compat',
        browserName: 'firefox',
        version: '54',
        compat: true,
        nativeShadowCompatible: false,
    },
    {
        label: 'sl_safari_compat',
        browserName: 'safari',
        platform: 'OS X 10.11',
        version: '10',
        compat: true,
        nativeShadowCompatible: false,
    },
];

function getMatchingBrowsers(config) {
    const { compat = false, nativeShadow = false } = config;

    return SAUCE_BROWSERS.filter(browser => {
        return (
            browser.compat === compat &&
            (!nativeShadow || browser.nativeShadowCompatible === nativeShadow)
        );
    });
}

module.exports = config => {
    localConfig(config);

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

    const matchingBrowsers = getMatchingBrowsers(config);
    if (!matchingBrowsers.length) {
        throw new Error(
            'No matching browser found for the passed configuration.',
        );
    }

    const browsers = matchingBrowsers.map(browser => {
        return browser.label;
    });
    const customLaunchers = matchingBrowsers.reduce((acc, browser) => {
        const { label, browserName, platform, version } = browser;
        return {
            ...acc,
            [label]: {
                base: 'SauceLabs',
                browserName,
                platform,
                version,
            },
        };
    }, {});

    config.set({
        sauceLabs: {
            username,
            accessKey,

            testName: 'LWC' + (config.compat ? ' - COMPAT' : ''),
            recordScreenshots: false,

            customData: {
                compat: config.compat,

                ci: !!process.env.CI,
                build: process.env.CIRCLE_BUILD_NUM || Date.now(),

                commit: process.env.CIRCLE_SHA1,
                branch: process.env.CIRCLE_BRANCH,
                buildUrl: process.env.CIRCLE_BUILD_URL,
            },
        },

        customLaunchers,
        browsers,

        // avoid spamming CI output
        reporters: process.env.CI
            ? ['dots', 'saucelabs', 'coverage']
            : ['progress', 'saucelabs', 'coverage'],

        plugins: [...config.plugins, 'karma-sauce-launcher'],

        // Force Karma to run in singleRun mode in order to shutdown the server after the tests finished to run.
        singleRun: true,
    });
};
