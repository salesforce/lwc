/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const {
    CIRCLE_BRANCH,
    CIRCLE_BUILD_NUM,
    CIRCLE_BUILD_URL,
    CIRCLE_SHA1,
    IS_CI,
    SAUCE_ACCESS_KEY,
    SAUCE_TUNNEL_ID,
    SAUCE_USERNAME,
} = require('../shared/options');

function getSauceSection({ suiteName, tags, customData }) {
    const username = SAUCE_USERNAME;
    if (!username) {
        throw new TypeError('Missing SAUCE_USERNAME environment variable');
    }

    const accessKey = SAUCE_ACCESS_KEY;
    if (!accessKey) {
        throw new TypeError('Missing SAUCE_ACCESS_KEY environment variable');
    }

    const buildId = CIRCLE_BUILD_NUM || Date.now();

    const testName = [suiteName, ...tags].join(' - ');
    const build = [suiteName, buildId, ...tags].join(' - ');

    return {
        username,
        accessKey,
        tunnelIdentifier: SAUCE_TUNNEL_ID,

        build,
        testName,
        tags,

        customData: {
            ...customData,

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

function createPattern(location, config = {}) {
    return {
        ...config,
        pattern: location,
    };
}

function getSauceConfig(config, { suiteName, tags, customData, browsers }) {
    return {
        sauceLabs: getSauceSection({ suiteName, tags, customData }),

        browsers: browsers.map((browser) => browser.label),
        customLaunchers: browsers.reduce((acc, browser) => {
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
    };
}

module.exports = {
    createPattern,
    getSauceConfig,
};
