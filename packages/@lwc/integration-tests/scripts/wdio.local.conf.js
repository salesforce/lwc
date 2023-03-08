/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const merge = require('deepmerge');

const baseConfig = require('./wdio.conf.js');

const headless = process.env.HEADLESS_CHROME !== 'false';
const drivers = {
    chrome: {
        version: 'latest',
    },
};

exports.config = merge(baseConfig.config, {
    maxInstances: 5,

    capabilities: [
        {
            browserName: 'chrome',
            'goog:chromeOptions': {
                args: headless ? ['headless', 'disable-gpu'] : [],
            },
        },
    ],

    services: [
        [
            'selenium-standalone',
            {
                installArgs: {
                    drivers,
                },
                args: {
                    drivers,
                },
            },
        ],
        'devtools', // exposes browser.cdp, only works locally: https://webdriver.io/docs/devtools-service/
    ],
});
