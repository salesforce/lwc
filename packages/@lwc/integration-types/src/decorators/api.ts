/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { LightningElement, api } from 'lwc';

// @ts-expect-error bare decorator cannot be used
api();

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

// @ts-expect-error decorator doesn't work on non-component classes
@api
export class NonComponent {
    // @ts-expect-error decorator doesn't work on non-component classes
    @api optionalProperty?: string;
    // @ts-expect-error decorator doesn't work on non-component classes
    @api propertyWithDefault = true;
    // @ts-expect-error decorator doesn't work on non-component classes
    @api nonNullAssertedProperty!: object;
    // @ts-expect-error decorator doesn't work on non-component classes
    @api method() {}
    // @ts-expect-error decorator doesn't work on non-component classes
    @api getter(): undefined {}
    // @ts-expect-error decorator doesn't work on non-component classes
    @api setter(_: string) {}
}

// @ts-expect-error decorator doesn't work on classes with non-component superclass
@api
export class Extendo extends class InlineNonsense {} {
    // @ts-expect-error decorator doesn't work on classes with non-component superclass
    @api optionalProperty?: string;
    // @ts-expect-error decorator doesn't work on classes with non-component superclass
    @api propertyWithDefault = true;
    // @ts-expect-error decorator doesn't work on classes with non-component superclass
    @api nonNullAssertedProperty!: object;
    // @ts-expect-error decorator doesn't work on classes with non-component superclass
    @api method() {}
    // @ts-expect-error decorator doesn't work on classes with non-component superclass
    @api getter(): undefined {}
    // @ts-expect-error decorator doesn't work on classes with non-component superclass
    @api setter(_: string) {}
}
