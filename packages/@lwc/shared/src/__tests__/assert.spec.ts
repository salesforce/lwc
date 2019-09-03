/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert } from '../index';

describe('assert', () => {
    describe('#invariant()', () => {
        it('should throw error that includes custom message', () => {
            expect(() => assert.invariant(false, 'foo bar')).toThrowError(/foo bar/);
        });

        it('should not throw error for true', () => {
            expect(() => assert.invariant(true, 'foo bar')).not.toThrow();
        });
    });

    describe('#isFalse()', () => {
        it('should throw error that includes custom message', () => {
            expect(() => assert.isFalse(true, 'foo bar')).toThrowError(/foo bar/);
        });

        it('should not throw error for true', () => {
            expect(() => assert.isFalse(false, 'foo bar')).not.toThrow();
        });
    });

    describe('#isFalse()', () => {
        it('should throw error that includes custom message', () => {
            expect(() => assert.isFalse(true, 'foo bar')).toThrowError(/foo bar/);
        });

        it('should not throw error for true', () => {
            expect(() => assert.isFalse(false, 'foo bar')).not.toThrow();
        });
    });

    describe('#fail()', () => {
        it('should throw error that includes custom message', () => {
            expect(() => assert.fail('foo bar')).toThrowError(/foo bar/);
        });
    });
});
