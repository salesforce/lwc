/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/* global jasmine */

const chalk = require('chalk');

const { CONSOLE_WHITELIST } = require('./test-whitelist');
const { toLogError, toLogWarning } = require('./matchers/log-matchers');

// Extract original methods from console
const { warn: originalWarn, error: originalError } = console;

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
    console.warn = jest.spyOn(console, 'warn');
    console.error = jest.spyOn(console, 'error');
});

afterEach(() => {
    const { fullName } = currentSpec;

    const isWhitelistedTest = CONSOLE_WHITELIST.includes(fullName);
    const didTestLogged = [...console.warn.mock.calls, ...console.error.mock.calls].length > 0;

    try {
        if (isWhitelistedTest) {
            if (!didTestLogged) {
                const message = [
                    `This test used to used to log a warning or an error, but don't log anymore.`,
                    `Please remove "${chalk.green.bold(fullName)}" from "${chalk.green.bold(
                        'test-whitelist.js'
                    )}"`,
                ].join('\n');

                throw new Error(message);
            }
        } else {
            if (didTestLogged) {
                const message = [
                    `Expect test not to log an error or a warning.\n`,
                    `If the message expected, make sure you asserts against those logs in the tests.\n`,
                    `Use instead: ${chalk.green.bold(
                        `expect(<function>).toLogError(<message>)`
                    )} or ${chalk.green.bold(`expect(<function>).toLogWarning(<message>)`)}`,
                ].join('\n');

                throw new Error(message);
            }
        }
    } finally {
        // Make sure to reset the original console methods after each tests
        console.warn = originalWarn;
        console.error = originalError;
    }
});

// Register custom console matchers in jasmine
expect.extend({
    toLogError,
    toLogWarning,
});
