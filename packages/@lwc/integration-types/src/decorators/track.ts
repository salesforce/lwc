/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { LightningElement, track } from 'lwc';

// This is okay! track has a non-decorator signature
track(123);
// This is okay because we treat implicit and explicit `undefined` identically
track(123, undefined);
// @ts-expect-error wrong number of arguments
track();
// @ts-expect-error wrong number of arguments
track({}, {});

// @ts-expect-error doesn't work on classes
@track
export default class Test extends LightningElement {
    @track optionalProperty?: string;
    @track propertyWithDefault = true;
    @track nonNullAssertedProperty!: object;
    // @ts-expect-error cannot be used on methods
    @track method() {}
    // @ts-expect-error cannot be used on getters
    @track getter(): undefined {}
    // @ts-expect-error cannot be used on setters
    @track setter(_: string) {}
}

// @ts-expect-error decorator doesn't work on non-component classes
@track
export class NonComponent {
    // @ts-expect-error decorator doesn't work on non-component classes
    @track optionalProperty?: string;
    // @ts-expect-error decorator doesn't work on non-component classes
    @track propertyWithDefault = true;
    // @ts-expect-error decorator doesn't work on non-component classes
    @track nonNullAssertedProperty!: object;
    // @ts-expect-error decorator doesn't work on non-component classes
    @track method() {}
    // @ts-expect-error decorator doesn't work on non-component classes
    @track getter(): undefined {}
    // @ts-expect-error decorator doesn't work on non-component classes
    @track setter(_: string) {}
}
