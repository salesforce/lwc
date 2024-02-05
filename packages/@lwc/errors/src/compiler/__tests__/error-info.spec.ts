/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as errorInfo from '../error-info';

// All exported objects are maps of label/error info, except for GENERIC_COMPILER_ERROR,
// which is a top-level error info object
const { GENERIC_COMPILER_ERROR, ...errors } = errorInfo;

const errorInfoMatcher = {
    code: expect.any(Number),
    message: expect.any(String),
    url: expect.any(String),
    // Technically not *any* number, but jest doesn't have oneOf
    level: expect.any(Number),
};

it('GENERIC_COMPILER_ERROR should be an error info object', () => {
    expect(GENERIC_COMPILER_ERROR).toEqual(errorInfoMatcher);
});

describe.each(Object.entries(errors))('%s errors', (_key, map) => {
    it('labels should all be UPPER_SNAKE_CASE', () => {
        Object.keys(map).forEach((label) => {
            expect(label).toMatch(/^[A-Z]+(?:_[A-Z]+?)*?$/);
        });
    });
    it.each(Object.entries(map))('%s should be an error info object', (_label, info) => {
        expect(info).toEqual(errorInfoMatcher);
    });
});

it('error codes are unique', () => {
    // Map of error codes to the errors that use them
    const seen = new Map([[GENERIC_COMPILER_ERROR.code, ['GENERIC_COMPILER_ERROR']]]);
    Object.entries(errors).forEach(([key, map]) => {
        Object.entries(map).forEach(([label, info]) => {
            const path = `${key}.${label}`;
            const prev = seen.get(info.code) ?? [];
            seen.set(info.code, [...prev, path]);
        });
    });
    // This assertion prints errors that use the same code for easier debugging
    for (const arr of seen.values()) {
        expect(arr).toHaveLength(1);
    }
});
