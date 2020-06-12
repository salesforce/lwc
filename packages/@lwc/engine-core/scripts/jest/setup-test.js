/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const chalk = require('chalk');

const { toLogError } = require('./matchers/log-error');

// Extract original methods from console
const { error: originalError } = console;

beforeEach(() => {
    console.error = jest.spyOn(console, 'error');
});

afterEach(() => {
    const didTestLogged = console.error.mock.calls.length > 0;

    try {
        if (didTestLogged) {
            const message = [
                `Expected the test to not result in an error being logged.`,
                `If this is expected, make sure to add an assertion for it:`,
                `${chalk.green.bold(`expect(<function>).toLogError(<message>)`)}`,
            ].join('\n');

            throw new Error(message);
        }
    } finally {
        console.error = originalError;
    }
});

// Register custom console matchers in jasmine
expect.extend({
    toLogError,
});
