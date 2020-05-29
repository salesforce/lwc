/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement } from '../../../src';

describe('CustomElementConstructor getter', () => {
    it('should have the default behavior of throwing an error', () => {
        expect(() => {
            class Test extends LightningElement {}
            Test.CustomElementConstructor;
        }).toThrowError();
    });
});
