/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { transform, transformSync } from '../../transformers/transformer';

function testValidateOptions(methodName: string, method: any) {
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
    it('returns a promise resolving to an object with code', () => {
        return expect(
            transform(`console.log('Hello')`, 'foo.js', { name: 'foo', namespace: 'x' })
        ).resolves.toMatchObject({
            code: expect.any(String),
        });
    });
});

describe('transformSync', () => {
    it('returns to an object with code', () => {
        expect(
            transformSync(`console.log('Hello')`, 'foo.js', { name: 'foo', namespace: 'x' })
        ).toMatchObject({
            code: expect.any(String),
        });
    });
});
