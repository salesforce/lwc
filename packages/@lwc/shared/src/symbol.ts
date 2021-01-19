/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// We use this to detect symbol support in order to avoid the expensive symbol polyfill. Note that
// we can't use typeof since it will fail when transpiling.
export const hasNativeSymbolSupport = /*@__PURE__*/ (() =>
    Symbol('x').toString() === 'Symbol(x)')();
