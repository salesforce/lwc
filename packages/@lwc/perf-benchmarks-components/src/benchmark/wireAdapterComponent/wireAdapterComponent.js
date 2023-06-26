/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement, wire, api } from 'lwc';
import { WireAdapter } from 'benchmark/wireAdapter';

export default class WireAdapterComponent extends LightningElement {
    @api data = {};
    @wire(WireAdapter) wiredContent;

    get wiredProp() {
        return this.wiredContent;
    }
}
