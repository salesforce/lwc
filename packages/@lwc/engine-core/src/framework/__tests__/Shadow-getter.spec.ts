/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement } from '../../../src';

describe('Shadow', () => {
    it('should be true for LightningElement', () => {
        expect(LightningElement.shadow).toBeTruthy();
    });

    it('should not override LightningElement.shadow', () => {
        class Test extends LightningElement {}
        Test.shadow = false;
        expect(LightningElement.shadow).toBeTruthy();
        expect(Test.shadow).toBeFalsy();
    });
});
