/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// const CHROME_BIN_PATH = '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary';
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const LWCIntegrationReporter = require('./reporter');
const MODE_COMPAT = 'compat';
const mode = process.env.MODE || MODE_COMPAT;
const webDriverPort = process.env.WD_PORT || 4567;
const suiteFolders = path.resolve(__dirname, '../', 'src/components');
/*
    SUITE
    {
        name: string, // folder names at src/components. attributes, dom, etc
        path: string, // fully qualified path to suite in src/components
        specs: Array<{
            mount: string, // browser where web driver will access spec
            path: string, // local file path where web driver will resolve mount path
        }>
    }
*/
const suites = fs.readdirSync(suiteFolders).map(suiteName => {
    const suitePath = path.resolve(suiteFolders, suiteName);
    const specs = fs.readdirSync(suitePath).map(specFolderName => {
        const testBasePath = path.basename(specFolderName).replace('test-', '');
        return {
            mount: `/${testBasePath}`,
            path: `./public/${suiteName}/${testBasePath}`,
        };
    });
    return {
        name: suiteName,
        path: suitePath,
        specs,
    };
});
const staticFolders = suites.reduce((seed, suite) => {
    return seed.concat(suite.specs);
}, []);

const wdSuites = suites.reduce((seed, suite) => {
    seed[suite.name] = [`${suite.path}/**/*.spec.js`];
    return seed;
}, {});

const config = {
    specs: ['./src/**/*.spec.js'],
    suites: wdSuites,
    maxInstances: 1,
    capabilities: [
        {
            // maxInstances can get overwritten per capability. So if you have an in-house Selenium
            // grid with only 5 firefox instances available you can make sure that not more than
            // 5 instances get started at a time.
            maxInstances: 1,
            //
            browserName: 'chrome',
            'goog:chromeOptions': {
                // binary: CHROME_BIN_PATH,
                args: ['headless', 'disable-gpu'],
            },
        },
    ],
    logLevel: 'silent',
    coloredLogs: true,
    bail: 0,
    screenshotPath: './errorShots/',
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 90000,
    connectionRetryCount: 2,
    services: ['static-server', 'chromedriver'],
    staticServerFolders: [{ mount: '/', path: './public' }].concat(staticFolders),
    staticServerPort: webDriverPort,
    framework: 'mocha',
    reporters: [LWCIntegrationReporter],
    reporterOptions: {
        LWCIntegrationReporter: {
            mode: mode.toUpperCase(),
        },
        junit: {
            outputDir: './results',
            outputFileFormat: function(opts) {
                return `results-${mode}.${opts.cid}.${opts.capabilities}.xml`;
            },
            packageName: mode.toUpperCase(),
        },
    },
    mochaOpts: {
        ui: 'bdd',
    },
};

const headless = process.env.HEADLESS_CHROME;

if (headless === 'false') {
    config.capabilities[0]['goog:chromeOptions'] = {};
}

exports.config = config;
