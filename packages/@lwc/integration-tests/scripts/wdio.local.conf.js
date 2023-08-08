/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const merge = require('deepmerge');

const baseConfig = require('./wdio.conf.js');

exports.config = merge(baseConfig.config, {
    maxInstances: 5,

    capabilities: [
        {
            browserName: 'chrome',
        },
    ],

    services: [
        // TODO [#3393]: re-enable once Circle CI can handle CDP again
        // 'devtools', // exposes browser.cdp, only works locally: https://webdriver.io/docs/devtools-service/
    ],
});
