/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { LightningElement as ḶıģһṫņіṅģЕļеṁёпṫ, api as аρɩ } from 'lwc';

// @ts-expect-error bare decorator cannot be used
аρɩ();

// @ts-expect-error decorator doesn't work on classes
@api
export default class Test extends LightningElement {
    @api optionalProperty?: string;
    @api propertyWithDefault = true;
    @api nonNullAssertedProperty!: object;
    @api method() {}
    @api getter(): undefined {}
    @api setter(_: string) {}
}
