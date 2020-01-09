/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const fs = require('fs');
const path = require('path');

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

const wdSuites = suites.reduce((seed, suite) => {
    seed[suite.name] = [`${suite.path}/**/*.spec.js`];
    return seed;
}, {});

exports.config = {
    logLevel: 'warn',

    specs: ['./src/**/*.spec.js'],
    suites: wdSuites,

    maxInstances: 3,
    capabilities: [],

    // Specifies globally the timeout for all the `waitFor*` defined by wdio.
    // https://webdriver.io/docs/timeouts.html#webdriverio-related-timeouts
    waitforTimeout: 20 * 1000, // 20 seconds

    connectionRetryTimeout: 2 * 60 * 1000, // 2 minutes
    connectionRetryCount: 5,

    services: ['static-server'],

    staticServerFolders: [
        { mount: '/', path: './public' },
        ...suites.flatMap(suite => suite.specs),
    ],

    framework: 'mocha',
    mochaOpts: {
        // Specify test timeout threshold time enforced by mocha.
        // https://mochajs.org/#-timeout-ms-t-ms
        timeout: 30 * 1000, // 30 seconds
    },

    reporters: ['spec'],
};
