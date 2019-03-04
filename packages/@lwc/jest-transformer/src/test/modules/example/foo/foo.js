/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement, api } from 'lwc';
import { echo } from './lib';

function pause(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

export default class Foo extends LightningElement {
    @api me = 'foo';

    get computedClass() {
        if (this.me === 'foo') {
            return 'fooClass';
        }
        return echo('otherClass');
    }

    @api
    async asyncMethod(val) {
        await pause(10);
        return val;
    }
}
