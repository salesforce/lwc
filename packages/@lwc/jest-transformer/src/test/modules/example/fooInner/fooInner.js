/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement, api } from 'lwc';
import { func } from 'globalLib';

const a = func();

export default class FooInner extends LightningElement {
    @api
    get globalLibReturn() {
        return a;
    }
}
