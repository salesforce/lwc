/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/* global globalThis */

const path = require('path');

const merge = require('deepmerge');
const minimist = require('minimist');

require('dotenv').config({
    path: path.resolve(__dirname, '../.env'),
});

const baseConfig = require('./wdio.conf.js');

const browsers = [
    // Note that headless Chrome also needs to be updated in wdio.conf.js for non-SauceLabs runs
    {
        commonName: 'chrome',
        browserName: 'chrome',
        version: 'latest',
    },
    {
        commonName: 'edge',
        browserName: 'MicrosoftEdge',
        version: 'latest',
    },
    {
        commonName: 'safari',
        browserName: 'safari',
        version: 'latest',
    },
    {
        commonName: 'firefox',
        browserName: 'firefox',
        version: 'latest',
    },
];

// Browsers that are only expected to work in compat mode
const compatBrowsers = [
    {
        commonName: 'ie11',
        browserName: 'internet explorer',
        version: '11',
    },
    {
        commonName: 'safari',
        browserName: 'safari',
        platform: 'OS X 10.11',
        version: '10',
    },
    {
        commonName: 'chrome',
        browserName: 'chrome',
        version: '59',
    },
    {
        commonName: 'firefox',
        browserName: 'firefox',
        version: '54',
    },
];

const mode = process.env.MODE;

const username = process.env.SAUCE_USERNAME;
if (!username) {
    throw new TypeError('Missing SAUCE_USERNAME environment variable');
}

const accessKey = process.env.SAUCE_ACCESS_KEY || process.env.SAUCE_KEY;
if (!accessKey) {
    throw new TypeError('Missing SAUCE_ACCESS_KEY or SAUCE_KEY environment variable');
}

const tunnelId = process.env.SAUCE_TUNNEL_ID;
const buildId = process.env.CIRCLE_BUILD_NUM || Date.now();

const name = ['integration-test', mode].join(' - ');
const build = ['integration-test', buildId, mode].join(' - ');
const tags = [mode];

const customData = {
    ci: !!process.env.CI,
    build: process.env.CIRCLE_BUILD_NUM,

    commit: process.env.CIRCLE_SHA1,
    branch: process.env.CIRCLE_BRANCH,
    buildUrl: process.env.CIRCLE_BUILD_URL,
};

function getCapabilities() {
    const isCompat = process.env.MODE && /compat/.test(process.env.MODE);
    let filtered = isCompat ? compatBrowsers : browsers;

    const args = minimist(process.argv.slice(2));
    const userBrowsers = args.browsers;

    if (userBrowsers) {
        filtered = filtered.filter((b) => {
            return userBrowsers.includes(b.commonName);
        });

        if (filtered.length === 0) {
            throw new Error(
                'No target browsers after filtering for the following browsers: ' + userBrowsers
            );
        }
    }

    return filtered.map((capability) => {
        return {
            ...capability,
            tunnelIdentifier: tunnelId,

            name,
            build,
            tags,
            customData,
        };
    });
}

exports.config = merge(baseConfig.config, {
    user: username,
    key: accessKey,

    capabilities: getCapabilities(),

    maxInstances: 3,

    // Specifies globally the timeout for all the `waitFor*` defined by wdio.
    // https://webdriver.io/docs/timeouts.html#webdriverio-related-timeouts
    waitforTimeout: 20 * 1000, // 20 seconds

    connectionRetryTimeout: 2 * 60 * 1000, // 2 minutes
    connectionRetryCount: 5,

    mochaOpts: {
        // Specify test timeout threshold time enforced by mocha.
        // https://mochajs.org/#-timeout-ms-t-ms
        timeout: 30 * 1000, // 30 seconds
    },
    beforeSession() {
        // Let us know we're running in Sauce Labs so tests can rely on this
        globalThis.IS_RUNNING_IN_SAUCE_LABS = true;
    },
});
