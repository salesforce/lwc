/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import * as target from '../utils';

describe('utils', () => {
    describe('#addCallbackToNextTick()', () => {
        it('should throw for non-callable values', () => {
            expect(() => target.addCallbackToNextTick(undefined)).toThrow();
            expect(() => target.addCallbackToNextTick('')).toThrow();
            expect(() => target.addCallbackToNextTick(NaN)).toThrow();
            expect(() => target.addCallbackToNextTick({})).toThrow();
            expect(() => target.addCallbackToNextTick(1)).toThrow();
        });

        it('should call callback asyncronously', () => {
            let flag = false;
            target.addCallbackToNextTick(() => {
                flag = true;
            });
            expect(flag).toBe(false);
            return Promise.resolve().then(() => {
                expect(flag).toBe(true);
            });
        });

        it('should call the callback once', () => {
            let counter = 0;
            target.addCallbackToNextTick(() => {
                counter += 1;
            });
            expect(counter).toBe(0);
            return Promise.resolve().then(() => {
                // wait for another tick
                return Promise.resolve().then(() => {
                    expect(counter).toBe(1);
                });
            });
        });

        it('should preserve the order of the callbacks', () => {
            let chars = 'a';
            target.addCallbackToNextTick(() => {
                chars += 'b';
            });
            target.addCallbackToNextTick(() => {
                chars += 'c';
            });
            expect(chars).toBe('a');
            return Promise.resolve().then(() => {
                expect(chars).toBe('abc');
            });
        });

        it('should release the references after ticking', () => {
            let chars = 'a';
            target.addCallbackToNextTick(() => {
                chars += 'b';
            });
            expect(chars).toBe('a');
            return Promise.resolve()
                .then(() => {
                    expect(chars).toBe('ab');
                    target.addCallbackToNextTick(() => {
                        chars += 'c';
                    });
                })
                .then(() => {
                    expect(chars).toBe('abc');
                });
        });
    });
});
