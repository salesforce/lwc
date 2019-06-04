/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { SyntheticShadowRoot } from '../../faux-shadow/shadow-root';

Object.defineProperty(window, 'ShadowRoot', {
    value: SyntheticShadowRoot,
    configurable: true,
    writable: true,
});
