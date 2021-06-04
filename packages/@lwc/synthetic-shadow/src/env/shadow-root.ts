/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isNull } from '@lwc/shared';

export const NativeShadowRoot: any = typeof ShadowRoot !== 'undefined' ? ShadowRoot : null;

export const isNativeShadowRootDefined = !isNull(NativeShadowRoot);

export const isInstanceOfNativeShadowRoot: (node: any) => boolean = isNull(NativeShadowRoot)
    ? () => false
    : (node) => node instanceof NativeShadowRoot;
