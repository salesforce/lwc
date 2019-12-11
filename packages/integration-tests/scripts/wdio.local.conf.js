/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const merge = require('deepmerge');

const baseConfig = require('./wdio.conf.js');

const HEADLESS = process.env.HEADLESS_CHROME !== 'false';

exports.config = merge(baseConfig.config, {
    capabilities: [
        {
            browserName: 'chrome',
            'goog:chromeOptions': {
                args: HEADLESS ? ['headless', 'disable-gpu'] : [],
            },
        },
    ],

    services: ['selenium-standalone'],
});
