/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const diff = require('jest-diff');

function toThrowErrorWithType(received, ctor, message) {
    let error;

    try {
        received();
    } catch (err) {
        error = err;
    }

    if (error === undefined) {
        return {
            message: () => 'Received function did not throw',
            pass: false,
        };
    }

    if (error === null || typeof error !== 'object' || error.constructor !== ctor) {
        return {
            message: () =>
                `Expected function to throw an instance of\n\n` +
                `Expected ${this.utils.printExpected(ctor.name)}\n` +
                `Received ${this.utils.printReceived(error.constructor.name)}`,
            pass: false,
        };
    }

    if (error.message !== message) {
        const errorDiff = diff.diffStringsUnified(message, error.message);
        return {
            message: () =>
                `Expected function to throw an error with message\n\n` +
                `Difference ${errorDiff}\n` +
                `Expected ${this.utils.printExpected(message)}\n` +
                `Received ${this.utils.printReceived(error.message)}`,
            pass: false,
        };
    }

    return {
        message: () => `Expected function not to throw an error`,
        pass: true,
    };
}

module.exports = {
    toThrowErrorWithType,
};
