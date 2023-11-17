/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const {
    GITHUB_RUN_ID,
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

    const buildId = GITHUB_RUN_ID || Date.now();

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
            buildId,
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
            // Karma-sauce-launcher uses the browserVersion key to determine if the format is W3C or JWP (deprecated).
            // https://github.com/karma-runner/karma-sauce-launcher/blob/59b0c5c877448e064ad56449cd906743721c6b62/src/utils.ts#L15-L18
            // Standard karma tests need to be in W3C in order to pass the sauce:options.
            // Details about W3C and JWP formats: https://saucelabs.com/platform/platform-configurator
            const {
                label,
                browserName,
                // platformName is only applicable for W3C
                platformName,
                // platform is only applicable for JWP
                platform,
                // browserVersion is only applicable for W3C
                browserVersion,
                // version is only applicable for JWP
                version,
                // sauce:options is only applicable for W3C
                sauceOptions,
            } = browser;
            return {
                ...acc,
                [label]: {
                    base: 'SauceLabs',
                    browserName,
                    platformName,
                    platform,
                    browserVersion,
                    version,
                    'sauce:options': sauceOptions,
                },
            };
        }, {}),

        // Use a less verbose reporter for the CI to avoid generating too much log.
        reporters: IS_CI
            ? [...config.reporters, 'dots', 'saucelabs']
            : [...config.reporters, 'progress', 'saucelabs'],

        plugins: [...config.plugins, 'karma-sauce-launcher-fix-firefox'],

        // Force Karma to run in singleRun mode in order to shutdown the server after the tests finished to run.
        singleRun: true,
    };
}

module.exports = {
    createPattern,
    getSauceConfig,
};
