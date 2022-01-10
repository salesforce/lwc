/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// This is a temporary workaround to get the @lwc/engine-server to evaluate in node without having
// to inject at runtime.
export const HTMLElementConstructor: typeof HTMLElement =
    typeof HTMLElement !== 'undefined' ? HTMLElement : (function () {} as any);
export const HTMLElementPrototype = HTMLElementConstructor.prototype;
