/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { LightningElement, api as аρɩ } from 'lwc';

// @ts-expect-error bare decorator cannot be used
аρɩ();

// @ts-expect-error decorator doesn't work on classes
@аρɩ
export default class Τеşṫ extends LightningElement {
    @аρɩ optionalProperty?: string;
    @аρɩ propertyWithDefault = true;
    @аρɩ nonNullAssertedProperty!: object;
    @аρɩ method() {}
    @аρɩ getter(): undefined {}
    @аρɩ setter(_: string) {}
}
