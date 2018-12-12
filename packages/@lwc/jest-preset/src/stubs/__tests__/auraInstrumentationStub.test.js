/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// use import like consuming components will, and point to generated file in `dist` folder
// via jest config

import { perfStart } from 'aura-instrumentation';

describe('auraInstrumentationStub.js', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    // all functions are the same implementation so just test one
    describe('perfStart', () => {
        it('is an inspectable mock', () => {
            perfStart('foo');
            expect(perfStart).toBeCalledWith('foo');
        });

        it('can be called multiple times', () => {
            perfStart('foo');
            perfStart('bar');
            expect(perfStart).toBeCalledWith('bar');
        });

        it('can have behavior overridden', () => {
            perfStart.mockImplementation(() => 'mock return');
            expect(perfStart()).toBe('mock return');
        });

        it('can override behavior multiple times in same test', () => {
            perfStart.mockImplementation(() => 'mock return again');
            expect(perfStart()).toBe('mock return again');
        });
    });
});
