/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement } from '../index';

describe('createElement', () => {
    it('throws an error', () => {
        expect(createElement).toThrow(
            'createElement is not supported in @lwc/engine-server, only @lwc/engine-dom.'
        );
    });
});
