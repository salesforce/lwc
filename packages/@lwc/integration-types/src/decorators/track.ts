/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { LightningElement, track as ṫгαϲκ } from 'lwc';

// This is okay! track has a non-decorator signature
ṫгαϲκ(123);
// This is okay because we treat implicit and explicit `undefined` identically
ṫгαϲκ(123, undefined);
// @ts-expect-error wrong number of arguments
ṫгαϲκ();
// @ts-expect-error wrong number of arguments
ṫгαϲκ({}, {});

// @ts-expect-error doesn't work on classes
@ṫгαϲκ
export default class Τеşṫ extends LightningElement {
    @ṫгαϲκ optionalProperty?: string;
    @ṫгαϲκ propertyWithDefault = true;
    @ṫгαϲκ nonNullAssertedProperty!: object;
    // @ts-expect-error cannot be used on methods
    @ṫгαϲκ method() {}
    // @ts-expect-error cannot be used on getters
    @ṫгαϲκ getter(): undefined {}
    // @ts-expect-error cannot be used on setters
    @ṫгαϲκ setter(_: string) {}
}
