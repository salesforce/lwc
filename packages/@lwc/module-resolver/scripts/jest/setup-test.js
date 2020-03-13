/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

expect.extend({
    toThrowErrorWithType(received, ctor, message) {
        let error;

        try {
            received();
        } catch (err) {
            error = err;
        }

        if (error === undefined) {
            return {
                message: () => 'received function did not throw',
                pass: false,
            };
        }

        if (error === null || typeof error !== 'object' || error.constructor !== ctor) {
            return {
                message: () =>
                    `expected function to throw an instance of "${ctor.name}" but thrown and instance of "${error.constructor.name}"`,
                pass: false,
            };
        }

        if (error.message !== message) {
            return {
                message: () =>
                    `expected function to throw an error with message: "${message}" but thrown an error with "${error.message}"`,
                pass: false,
            };
        }

        return {
            message: () =>
                `expected function not to throw a "${ctor.name}" error with message "${message}"`,
            pass: true,
        };
    },
});
