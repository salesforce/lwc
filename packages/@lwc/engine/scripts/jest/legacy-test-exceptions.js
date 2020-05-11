/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
 * List of all tests that are permitted to log a warning or an error.
 *
 * The goal is disallow uninstrumented usage of logging in unit tests. All the tests
 * logging a warning or an error, that are not part of this list will automatically fail.
 *
 * BY ADDING A NEW ENTRY IN THIS LIST, YOU WILL BRING SHAME ON YOURSELF OVER MULTIPLE GENERATIONS!!
 */
const LEGACY_TEST_EXCEPTIONS = ['api #i() should support various types'];

for (let i = 0; i < LEGACY_TEST_EXCEPTIONS.length; i++) {
    for (let j = i + 1; j < LEGACY_TEST_EXCEPTIONS.length; j++) {
        if (LEGACY_TEST_EXCEPTIONS[i] === LEGACY_TEST_EXCEPTIONS[j]) {
            throw new Error(`Duplicate test name "${LEGACY_TEST_EXCEPTIONS[i]}"`);
        }
    }
}

module.exports = {
    LEGACY_TEST_EXCEPTIONS,
};
