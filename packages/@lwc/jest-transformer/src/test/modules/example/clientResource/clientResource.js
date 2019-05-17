/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement, api } from 'lwc';
import formFactor from '@salesforce/client/formFactor';

export default class ClientResource extends LightningElement {
    @api getFormFactorValue() {
        return formFactor;
    }
}
