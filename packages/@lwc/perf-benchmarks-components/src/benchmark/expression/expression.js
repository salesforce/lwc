/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement } from 'lwc';

export default class Sample extends LightningElement {
    expr1() {
        return 'bar';
    }

    expr2 = { expr21: { expr22: 'expr22' } };
    expr3 = [{ expr33: 'expr33' }];
}
