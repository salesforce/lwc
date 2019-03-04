/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { echo, globalLibCall } from '../lib';

describe('lib.js', () => {
    it('returns string parameter passed to it', () => {
        const expected = 'expected';
        const actual = echo(expected);
        expect(expected).toBe(actual);
    });

    it('gets globalLib mock from __mocks__', () => {
        expect(globalLibCall()).toBe('from __mocks__');
    });
});
