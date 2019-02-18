/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// force non-headless Chrome on Sauce Labs for debugability
process.env.HEADLESS_CHROME = false;

const merge = require('deepmerge');
const minimist = require('minimist');

const base = require('./wdio.conf.js');

const browsers = [
    // Note that headless Chrome also needs to be updated in wdio.conf.js for non-SauceLabs runs
    {
        commonName: 'chrome',
        browserName: 'chrome',
        platform: 'Windows 10',
        version: '61.0',
        chromeOptions: {
            //binary: CHROME_BIN_PATH,
            args: ['headless', 'disable-gpu'],
        },
    },
    {
        commonName: 'edge',
        browserName: 'MicrosoftEdge',
        platform: 'Windows 10',
        version: '15.15063',
    },
    {
        commonName: 'safari',
        browserName: 'safari',
        platform: 'macOS 10.12',
        version: '11.0',
    },
    {
        commonName: 'firefox',
        browserName: 'firefox',
        platform: 'macOS 10.12',
        version: '55.0',
    },
];

// Browsers that are only expected to work in compat mode
const compatBrowsers = [
    {
        commonName: 'ie11',
        browserName: 'internet explorer',
        platform: 'Windows 10',
        version: '11.103',
        iedriverVersion: '3.4.0',
    },
    {
        // ideally this would be 10.1 (or latest 10.x available) but there is
        // a bug in SafariDriver for 10.1 and window management
        commonName: 'safari10',
        browserName: 'safari',
        platform: 'OS X 10.11',
        version: '10.0',
    },
    {
        commonName: 'safari9',
        browserName: 'safari',
        platform: 'OS X 10.11',
        version: '9.0',
    },
    {
        commonName: 'chrome30',
        browserName: 'chrome',
        platform: 'Windows 8.1',
        version: '30.0',
    },
    {
        commonName: 'firefox45',
        browserName: 'firefox',
        platform: 'Windows 8',
        version: '45.0',
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

const sauceServiceConfig = {
    user: username,
    key: accessKey,

    sauceConnect: false,

    capabilities: getCapabilities(),
};

function getCapabilities() {
    const isCompat = process.env.MODE && /compat/.test(process.env.MODE);
    let filtered = isCompat ? compatBrowsers : browsers;

    const args = minimist(process.argv.slice(2));
    const userBrowsers = args.browsers;

    if (userBrowsers) {
        filtered = filtered.filter(b => {
            return userBrowsers.includes(b.commonName);
        });

        if (filtered.length === 0) {
            throw new Error('No target browsers after filtering for the following browsers: ' + userBrowsers);
        }
    }

    return filtered.map(capability => {
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

exports.config = merge(base.config, sauceServiceConfig);
