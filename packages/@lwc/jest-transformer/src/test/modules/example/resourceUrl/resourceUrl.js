/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement } from 'lwc';
import mockedImport from '@salesforce/resourceUrl/mocked';
import unmockedImport from '@salesforce/resourceUrl/unmocked';

export default class ResourceUrl extends LightningElement {
    mockedResource = mockedImport;
    unmockedResource = unmockedImport;
}
