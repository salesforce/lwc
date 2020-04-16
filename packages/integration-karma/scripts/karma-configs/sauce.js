/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const localConfig = require('./base');

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
        platform: 'OS X 10.11',
        version: '10',
        compat: true,
        nativeShadowCompatible: false,
    },
];

function getSauceConfig(config) {
    const username = process.env.SAUCE_USERNAME;
    if (!username) {
        throw new TypeError('Missing SAUCE_USERNAME environment variable');
    }

    const accessKey = process.env.SAUCE_ACCESS_KEY || process.env.SAUCE_KEY;
    if (!accessKey) {
        throw new TypeError('Missing SAUCE_ACCESS_KEY or SAUCE_KEY environment variable');
    }

    const buildId = process.env.CIRCLE_BUILD_NUM || Date.now();

    const tags = config.lwc.tags;
    const testName = ['integration-karma', ...tags].join(' - ');
    const build = ['integration-karma', buildId, ...tags].join(' - ');

    return {
        username,
        accessKey,
        tunnelIdentifier: process.env.SAUCE_TUNNEL_ID,

        build,
        testName,
        tags,

        customData: {
            lwc: config.lwc,

            ci: !!process.env.CI,
            build: process.env.CIRCLE_BUILD_NUM,

            commit: process.env.CIRCLE_SHA1,
            branch: process.env.CIRCLE_BRANCH,
            buildUrl: process.env.CIRCLE_BUILD_URL,
        },

        startConnect: false,
        recordVideo: false,
        recordScreenshots: false,
    };
}

function getMatchingBrowsers({ compat, nativeShadow }) {
    return SAUCE_BROWSERS.filter((browser) => {
        return (
            browser.compat === compat &&
            (!nativeShadow || browser.nativeShadowCompatible === nativeShadow)
        );
    });
}

module.exports = (config) => {
    localConfig(config);

    const sauceConfig = getSauceConfig(config);

    const matchingBrowsers = getMatchingBrowsers(config.lwc);
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
        reporters: process.env.CI
            ? [...config.reporters, 'dots', 'saucelabs']
            : [...config.reporters, 'progress', 'saucelabs'],

        plugins: [...config.plugins, 'karma-sauce-launcher'],

        // Force Karma to run in singleRun mode in order to shutdown the server after the tests finished to run.
        singleRun: true,
    });
};
