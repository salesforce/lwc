/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// TypeScript seems to be missing this definition from dom.d.ts. It can be removed when
// this is fixed: https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1338
declare interface CustomElementConstructor {
    new (...params: any[]): HTMLElement;
    observedAttributes?: string[];

    // TS is also missing Form Associated Custom Elements
    // https://web.dev/more-capable-form-controls/#defining-a-form-associated-custom-element
    formAssociated?: boolean;
}
