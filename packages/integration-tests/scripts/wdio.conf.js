/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 4567;
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
const suites = fs.readdirSync(suiteFolders).map((suiteName) => {
    const suitePath = path.resolve(suiteFolders, suiteName);
    const specs = fs.readdirSync(suitePath).map((specFolderName) => {
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

    baseUrl: `http://localhost:${port}`,

    capabilities: [],

    waitforTimeout: 10000,
    connectionRetryTimeout: 90000,

    framework: 'mocha',
    reporters: ['spec'],

    services: [
        [
            'static-server',
            {
                port,
                folders: [
                    { mount: '/', path: './public' },
                    ...suites.flatMap((suite) => suite.specs),
                ],
            },
        ],
    ],
};
