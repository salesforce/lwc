/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const { getSauceConfig } = require('../utils');
const { COMPAT, SYNTHETIC_SHADOW_ENABLED } = require('../../shared/options');

const TAGS = require('./tags');
const localConfig = require('./base');

const SAUCE_BROWSERS = [
    // Standard browsers
    {
        label: 'sl_chrome_latest',
        browserName: 'chrome',
        browserVersion: 'latest',
        compat: false,
        nativeShadowCompatible: true,
        test_hydration: true,
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
        compat: false,
        nativeShadowCompatible: true,
        test_hydration: true,
        sauceOptions: {
            geckodriverVersion: '0.30.0',
        },
    },
    {
        label: 'sl_safari_latest',
        browserName: 'safari',
        browserVersion: 'latest',
        compat: false,
        nativeShadowCompatible: true,
        test_hydration: true,
        platformName: 'macOS 12', // Note: this must be updated when macOS releases new updates
    },

    // Compat browsers
    {
        label: 'sl_edge_compat',
        browserName: 'MicrosoftEdge',
        version: '18',
        compat: true,
        nativeShadowCompatible: false,
    },
    {
        label: 'sl_chrome_compat',
        browserName: 'chrome',
        version: 'latest-2',
        compat: true,
        nativeShadowCompatible: true,
    },
    {
        label: 'sl_safari_compat',
        browserName: 'safari',
        version: '13',
        compat: true,
        nativeShadowCompatible: true,
    },
].filter((browser) => {
    return (
        browser.compat === COMPAT &&
        (SYNTHETIC_SHADOW_ENABLED || browser.nativeShadowCompatible !== SYNTHETIC_SHADOW_ENABLED)
    );
});

module.exports = (config) => {
    localConfig(config);

    if (SAUCE_BROWSERS.length === 0) {
        throw new Error('No matching browser found for the passed configuration.');
    }

    const sauceConfig = getSauceConfig(config, {
        suiteName: 'integration-karma',
        tags: TAGS,
        customData: {
            lwc: {
                COMPAT,
                DISABLE_SYNTHETIC: !SYNTHETIC_SHADOW_ENABLED,
            },
        },
        browsers: SAUCE_BROWSERS,
    });

    config.set(sauceConfig);
};
