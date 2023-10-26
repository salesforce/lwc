/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const merge = require('deepmerge');

const baseConfig = require('./wdio.conf.js');

const headless = process.env.HEADLESS_CHROME !== 'false';

exports.config = merge(baseConfig.config, {
    maxInstances: 5,

    capabilities: [
        {
            browserName: 'chrome',
            'goog:chromeOptions': {
                args: headless ? ['headless=new'] : [],
            },
        },
    ],

    services: [
        // TODO [#3393]: re-enable once Circle CI can handle CDP again
        // To re-enable this, we would need to re-install @wdio/devtools-service
        // 'devtools', // exposes browser.cdp, only works locally: https://webdriver.io/docs/devtools-service/
    ],
});
