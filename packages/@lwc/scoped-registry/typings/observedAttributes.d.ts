/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// TypeScript seems to be missing this definition from dom.d.ts. It can be removed when
// this is fixed: https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1338
declare interface CustomElementConstructor {
    observedAttributes?: string[];
}
