/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement, api } from 'lwc';

import ApexMethod from '@salesforce/apex/FooClass.FooMethod';
import ApexMethod2 from '@salesforce/apex/FooClass.FooMethod2';
import { refreshApex, getSObjectValue } from '@salesforce/apex';

export default class Apex extends LightningElement {
    @api
    callDefaultImport() {
        return ApexMethod().then(() => {
            return 'from test';
        });
    }

    @api
    callDefaultImport2() {
        return ApexMethod2().then(() => {
            return 'from test';
        });
    }

    @api
    callRefreshApex() {
        return refreshApex().then(() => {
            return 'from test';
        });
    }

    @api
    callGetSObjectValue() {
        getSObjectValue('from test');
    }
}
