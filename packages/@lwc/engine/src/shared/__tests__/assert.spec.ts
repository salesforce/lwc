/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from '../assert';

const _originalConsole = global.console;
const restoreConsole = () => {
    global.console = _originalConsole;
};

describe('assert', () => {
    afterEach(restoreConsole);

    describe('logError', () => {
        it('should prefix error messages with [LWC error]', () => {
            global.console = { error: jest.fn() };

            assert.logError('error-msg', null);

            expect(global.console.error).toBeCalled();
            expect(global.console.error.mock.calls[0][0]).toBe('[LWC error]: error-msg');
        });
    });

    describe('logWarning', () => {
        it('should prefix warning messages with [LWC warning]', () => {
            global.console = { warn: jest.fn() };

            assert.logWarning('warning-msg', null);

            expect(global.console.warn).toBeCalled();
            expect(global.console.warn.mock.calls[0][0]).toBe('[LWC warning]: warning-msg');
        });
    });
});
