/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement } from 'lwc';

// --- valid usage --- //

export class LightAsConst extends LightningElement {
    static renderMode = 'light' as const;
}
export class ShadowAsConst extends LightningElement {
    static renderMode = 'shadow' as const;
}
export class ExplicitLight extends LightningElement {
    // eslint-disable-next-line @typescript-eslint/prefer-as-const
    static renderMode: 'light' = 'light';
}
export class ExplicitShadow extends LightningElement {
    // eslint-disable-next-line @typescript-eslint/prefer-as-const
    static renderMode: 'shadow' = 'shadow';
}
export class Undefined extends LightningElement {
    static renderMode = undefined;
}

// --- invalid usage --- //

// @ts-expect-error This `renderMode` is not 'light' | 'shadow' | undefined
export class Invalid extends LightningElement {
    static renderMode = 'invalid';
}
// @ts-expect-error Common foot-gun! This `renderMode` is inferred as 'string'
export class ImplicitLight extends LightningElement {
    static renderMode = 'light';
}
// @ts-expect-error Common foot-gun! This `renderMode` is inferred as 'string'
export class ImplicitShadow extends LightningElement {
    static renderMode = 'shadow';
}
