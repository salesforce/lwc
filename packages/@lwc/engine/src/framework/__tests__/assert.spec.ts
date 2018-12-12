/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from '../../shared/assert';

describe('assert', () => {
    describe('#isTrue()', () => {
        it('should throw error that includes custom message', () => {
            expect(
                () => assert.isTrue(false, 'foo bar')
            ).toThrowError(/foo bar/);
        });

        it('should not throw error for true', () => {
            expect(
                () => assert.isTrue(true, 'foo bar')
            ).not.toThrow();
        });
    });

    describe('#vnode()', () => {
        it('should throw Error for undefined', () => {
            expect(() => assert.vnode(undefined as any)).toThrow();
        });
    });

    describe('#vm()', () => {
        it('should throw Error for undefined', () => {
            expect(() => assert.vm(undefined as any)).toThrow();
        });
    });
});
