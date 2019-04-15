/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { transform, transformSync } from '../../transformers/transformer';

function testValidateOptions(methodName, method) {
    describe('validate options', () => {
        it(`${methodName} should validate presence of src`, () => {
            expect(() => method()).toThrow(/Expect a string for source. Received undefined/);
        });

        it(`${methodName} should validate presence of filename`, () => {
            expect(() => method(`console.log('Hello')`)).toThrow(
                /Expect a string for id. Received undefined/
            );
        });
    });
}

testValidateOptions('transform', transform);
testValidateOptions('transformSync', transformSync);

describe('transform', () => {
    it('returns the a promise resolving to an object with code', () => {
        expect(transform(`console.log('Hello')`, 'foo.js', {})).resolves.toMatchObject({
            code: expect.any(String),
        });
    });
});

describe('transformSync', () => {
    it('returns to an object with code', () => {
        expect(transformSync(`console.log('Hello')`, 'foo.js', {})).toMatchObject({
            code: expect.any(String),
        });
    });
});
