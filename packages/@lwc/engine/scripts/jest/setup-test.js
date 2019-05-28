/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/* global jasmine */

const chalk = require('chalk');

const { CONSOLE_WHITELIST } = require('./test-whitelist');
const { toLogError } = require('./matchers/log-error');

// Extract original methods from console
const { error: originalError } = console;

let currentSpec;
jasmine.getEnv().addReporter({
    specStarted(spec) {
        currentSpec = spec;
    },
    specDone() {
        currentSpec = null;
    },
});

beforeEach(() => {
    console.error = jest.spyOn(console, 'error');
});

afterEach(() => {
    const { fullName } = currentSpec;

    const isWhitelistedTest = CONSOLE_WHITELIST.includes(fullName);
    const didTestLogged = console.error.mock.calls.length > 0;

    try {
        if (isWhitelistedTest) {
            if (!didTestLogged) {
                const boldedName = chalk.green.bold(fullName);
                const boldedFile = chalk.green.bold('test-whitelist.js');
                const message = [
                    `This test used to log an error but no longer does.`,
                    `Please remove "${boldedName}" from "${boldedFile}"`,
                ].join('\n');

                throw new Error(message);
            }
        } else {
            if (didTestLogged) {
                const message = [
                    `Expected the test to not result in an error being logged.`,
                    `If this is expected, make sure to add an assertion for it:`,
                    `${chalk.green.bold(`expect(<function>).toLogError(<message>)`)}`,
                ].join('\n');

                throw new Error(message);
            }
        }
    } finally {
        console.error = originalError;
    }
});

// Register custom console matchers in jasmine
expect.extend({
    toLogError,
});
