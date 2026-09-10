/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { getOwnPropertyDescriptor } from '@lwc/shared';

// Capture the global `ShadowRoot` since synthetic shadow will override it later
export const NativeShadowRoot = ShadowRoot;

export const isInstanceOfNativeShadowRoot = (node: any) => node instanceof NativeShadowRoot;

// Captured before synthetic shadow patches the prototype, so the wrappers see the real native sinks.
export const nativeShadowRootInnerHTMLDescriptor = getOwnPropertyDescriptor(
    NativeShadowRoot.prototype,
    'innerHTML'
);
export const nativeShadowRootSetHTMLUnsafe = (NativeShadowRoot.prototype as any).setHTMLUnsafe as
    ((html: any, ...rest: unknown[]) => void) | undefined;
