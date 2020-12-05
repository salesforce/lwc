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
                    ...suites.map((suite) => suite.specs).reduce((acc, arr) => acc.concat(arr)),
                ],
            },
        ],
    ],

    before(caps, spec, browser) {
        browser.addCommand('activeElement', function () {
            return this.$(function () {
                return document.activeElement;
            });
        });

        browser.addCommand(
            'activeElementShadow',
            function () {
                return this.$(function () {
                    if (!this.shadowRoot) {
                        throw new Error('Invalid target for "activeElementShadow"');
                    }

                    return this.shadowRoot.activeElement;
                });
            },
            true
        );

        browser.addCommand('activeElementShadowDeep', function () {
            return this.$(function () {
                var active = document.activeElement;
                while (active.shadowRoot && active.shadowRoot.activeElement) {
                    active = active.shadowRoot.activeElement;
                }
                return active;
            });
        });

        browser.addCommand('shadowDeep$', async function (...selectors) {
            const [head, ...rest] = selectors;

            let elm = await this.$(head);
            for (const selector of rest) {
                elm = await elm.shadow$(selector);
            }

            return elm;
        });

        browser.addCommand(
            'focus',
            function () {
                return this.execute(function (target) {
                    target.focus();
                }, this);
            },
            true
        );
    },

    beforeTest(test) {
        const location = path.basename(test.file).replace('.spec.js', '');
        return browser.url(location);
    },
};
