/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import decorate from '../decorate';

describe('decorate.ts', () => {
    describe('decorate() api', () => {
        it('should throw when invoking it with no arguments', () => {
            expect(() => {
                decorate();
            }).toThrow();
        });

        it('should throw when invoking it with a non-function', () => {
            expect(() => {
                decorate({}, {});
            }).toThrow();
        });

        it('should throw when invoking it with an invalid decorator descriptor', () => {
            expect(() => {
                class f {}
                decorate(f, undefined);
            }).toThrow();
        });

        it('should throw when passed an invalid decorator', () => {
            expect(() => {
                class f {}
                decorate(f, {
                    x: undefined,
                });
            }).toThrow();
        });
    });
    describe('decorate()', () => {
        it('can be chained', () => {
            class f {}
            expect(decorate(f, {})).toBe(f);
        });
        it('should decorate a class', () => {
            expect.assertions(7);
            class f {
                get y() {
                    return 1;
                }
                set y(v) {}
            }
            decorate(f, {
                x: function(Ctor, key, descriptor) {
                    expect(Ctor).toBe(f);
                    expect(key).toBe('x');
                    expect(descriptor).toBe(undefined);
                    return {
                        value: 1,
                    };
                },
                y: function(Ctor, key, descriptor) {
                    expect(Ctor).toBe(f);
                    expect(key).toBe('y');
                    expect(descriptor.configurable).toBe(true);
                    return descriptor;
                },
            });
            expect(new f().x).toBe(1);
        });
    });
});
