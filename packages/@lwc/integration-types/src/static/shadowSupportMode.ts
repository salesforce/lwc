/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement } from 'lwc';

// --- valid usage --- //

export class AnyAsConst extends LightningElement {
    static shadowSupportMode = 'any' as const;
}
export class ResetAsConst extends LightningElement {
    static shadowSupportMode = 'reset' as const;
}
export class NativeAsConst extends LightningElement {
    static shadowSupportMode = 'native' as const;
}
export class Undefined extends LightningElement {
    static shadowSupportMode = undefined;
}
export class ExplicitAny extends LightningElement {
    // eslint-disable-next-line @typescript-eslint/prefer-as-const
    static shadowSupportMode: 'any' = 'any';
}
export class ExplicitReset extends LightningElement {
    // eslint-disable-next-line @typescript-eslint/prefer-as-const
    static shadowSupportMode: 'reset' = 'reset';
}
export class ExplicitNative extends LightningElement {
    // eslint-disable-next-line @typescript-eslint/prefer-as-const
    static shadowSupportMode: 'native' = 'native';
}

// --- invalid usage --- //

// @ts-expect-error invalid value
export class DefaultAsConst extends LightningElement {
    static shadowSupportMode = 'default' as const;
}
// @ts-expect-error type is too broad
export class ImplicitAny extends LightningElement {
    static shadowSupportMode = 'any';
}
// @ts-expect-error must use enum
export class ImplicitReset extends LightningElement {
    static shadowSupportMode = 'reset';
}
// @ts-expect-error must use enum
export class ImplicitNative extends LightningElement {
    static shadowSupportMode = 'native';
}
