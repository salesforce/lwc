/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement, api } from 'lwc';

import ApexMethod from '@salesforce/apex/FooClass.FooMethod';
import AnotherApexMethod from '@salesforce/apex/Namespace.BarClass.BarMethod';
import { refreshApex, getSObjectValue } from '@salesforce/apex';

export default class Apex extends LightningElement {
    @api
    callDefaultImport() {
        return ApexMethod().then(() => {
            return 'from test';
        });
    }

    @api
    callAnotherDefaultImport() {
        return AnotherApexMethod().then(() => {
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
