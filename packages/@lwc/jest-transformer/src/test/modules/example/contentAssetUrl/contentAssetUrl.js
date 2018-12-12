/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement } from 'lwc';
import mockedImport from '@salesforce/contentAssetUrl/mocked';
import unmockedImport from '@salesforce/contentAssetUrl/unmocked';

export default class ContentAssetUrl extends LightningElement {
    mockedAsset = mockedImport;
    unmockedAsset = unmockedImport;
}
