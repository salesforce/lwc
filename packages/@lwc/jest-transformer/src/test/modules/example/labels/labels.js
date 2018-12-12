/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement, track } from 'lwc';
import mockedImport from '@salesforce/label/c.mocked';
import unmockedImport from '@salesforce/label/c.unmocked';

export default class Labels extends LightningElement {
    @track
    mockedLabel = mockedImport;

    @track
    unmockedLabel = unmockedImport;
}
