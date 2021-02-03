/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const localConfig = require('./base');
const {
    COMPAT,
    NATIVE_SHADOW,
    TAGS,
    SAUCE_USERNAME,
    SAUCE_ACCESS_KEY,
    SAUCE_TUNNEL_ID,
    IS_CI,
    CIRCLE_BRANCH,
    CIRCLE_BUILD_NUM,
    CIRCLE_BUILD_URL,
    CIRCLE_SHA1,
} = require('../shared/options');

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
        version: 'latest',
        compat: false,
        nativeShadowCompatible: true,
    },

    // Compat browsers
    {
        label: 'sl_ie11',
        browserName: 'internet explorer',
        version: '11',
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
        version: '10',
        platform: 'OS X 10.11',
        compat: true,
        nativeShadowCompatible: false,
    },
];

function getSauceConfig() {
    const username = SAUCE_USERNAME;
    if (!username) {
        throw new TypeError('Missing SAUCE_USERNAME environment variable');
    }

    const accessKey = SAUCE_ACCESS_KEY;
    if (!accessKey) {
        throw new TypeError('Missing SAUCE_ACCESS_KEY environment variable');
    }

    const buildId = CIRCLE_BUILD_NUM || Date.now();

    const testName = ['integration-karma', ...TAGS].join(' - ');
    const build = ['integration-karma', buildId, ...TAGS].join(' - ');

    return {
        username,
        accessKey,
        tunnelIdentifier: SAUCE_TUNNEL_ID,

        build,
        testName,
        tags: TAGS,

        customData: {
            lwc: {
                COMPAT,
                NATIVE_SHADOW,
            },

            ci: IS_CI,

            build: CIRCLE_BUILD_NUM,
            commit: CIRCLE_SHA1,
            branch: CIRCLE_BRANCH,
            buildUrl: CIRCLE_BUILD_URL,
        },

        startConnect: false,
        recordVideo: false,
        recordScreenshots: false,
    };
}

function getMatchingBrowsers() {
    return SAUCE_BROWSERS.filter((browser) => {
        return (
            browser.compat === COMPAT &&
            (!NATIVE_SHADOW || browser.nativeShadowCompatible === NATIVE_SHADOW)
        );
    });
}

module.exports = (config) => {
    localConfig(config);

    const sauceConfig = getSauceConfig();
    const matchingBrowsers = getMatchingBrowsers();

    if (matchingBrowsers.length === 0) {
        throw new Error('No matching browser found for the passed configuration.');
    }

    config.set({
        sauceLabs: sauceConfig,

        browsers: matchingBrowsers.map((browser) => browser.label),
        customLaunchers: matchingBrowsers.reduce((acc, browser) => {
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
        }, {}),

        // Use a less verbose reporter for the CI to avoid generating too much log.
        reporters: IS_CI
            ? [...config.reporters, 'dots', 'saucelabs']
            : [...config.reporters, 'progress', 'saucelabs'],

        plugins: [...config.plugins, 'karma-sauce-launcher'],

        // Force Karma to run in singleRun mode in order to shutdown the server after the tests finished to run.
        singleRun: true,
    });
};
