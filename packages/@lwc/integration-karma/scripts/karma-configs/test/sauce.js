/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const { COMPAT, SYNTHETIC_SHADOW_ENABLED } = require('../../shared/options');
const TAGS = require('./tags');

const localConfig = require('./base');
const { getSauceConfig } = require('../utils');

const SAUCE_BROWSERS = [
    // Standard browsers
    {
        label: 'sl_chrome_latest',
        browserName: 'chrome',
        version: 'latest',
        compat: false,
        nativeShadowCompatible: true,
        test_hydration: true,
    },
    {
        label: 'sl_firefox_latest',
        browserName: 'firefox',
        version: 'latest',
        compat: false,
        nativeShadowCompatible: true,
        test_hydration: true,
    },
    {
        label: 'sl_safari_latest',
        browserName: 'safari',
        version: 'latest',
        compat: false,
        nativeShadowCompatible: true,
        test_hydration: true,
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
