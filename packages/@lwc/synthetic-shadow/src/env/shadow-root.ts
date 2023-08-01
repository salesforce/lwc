/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isNull } from '@lwc/shared';

const NativeShadowRoot = ShadowRoot;

export const isInstanceOfNativeShadowRoot: (node: any) => boolean = isNull(NativeShadowRoot)
    ? () => false
    : (node) => node instanceof NativeShadowRoot;
