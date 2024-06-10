/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement } from 'lwc';
import { ShadowSupportMode } from '@lwc/engine-core/dist/framework/vm';

// --- valid usage --- //

export class EnumAny extends LightningElement {
    static shadowSupportMode = ShadowSupportMode.Any;
}
export class EnumDefault extends LightningElement {
    static shadowSupportMode = ShadowSupportMode.Default;
}
export class EnumNative extends LightningElement {
    static shadowSupportMode = ShadowSupportMode.Native;
}
export class Undefined extends LightningElement {
    static shadowSupportMode = undefined;
}

// --- invalid usage --- //

// @ts-expect-error must use enum
export class LiteralAny extends LightningElement {
    static shadowSupportMode = 'any' as const;
}
// @ts-expect-error must use enum
export class Default extends LightningElement {
    static shadowSupportMode = 'default' as const;
}
// @ts-expect-error must use enum
export class Native extends LightningElement {
    static shadowSupportMode = 'native' as const;
}
