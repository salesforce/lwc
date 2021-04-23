/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement } from '../../../src';

Object.freeze(LightningElement); // because we freeze before exporting for users as well

describe('Shadow', () => {
    it('should be true for LightningElement', () => {
        expect(LightningElement.shadow).toBeTruthy();
    });

    it('should not override LightningElement.shadow', () => {
        class Base extends LightningElement {}
        Base.shadow = false;
        class Test extends Base {}
        Test.shadow = true;
        expect(LightningElement.shadow).toBeTruthy();
        expect(Base.shadow).toBeFalsy();
        expect(Test.shadow).toBeTruthy();
    });
});
