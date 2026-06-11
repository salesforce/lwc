/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Capture the global `ShadowRoot` since synthetic shadow will override it later
const NativeShadowRoot = ShadowRoot;

export const isInstanceOfNativeShadowRoot = (node: any) => node instanceof NativeShadowRoot;
