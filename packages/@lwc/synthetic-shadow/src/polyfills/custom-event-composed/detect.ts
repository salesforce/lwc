/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { PatchedCustomEvent } from './polyfill';

export default function detect(): boolean {
    // We need to check if CustomEvent is our PatchedCustomEvent because jest
    // will reset the window object but not constructos and prototypes (e.g.,
    // Event.prototype).
    // https://github.com/jsdom/jsdom#shared-constructors-and-prototypes
    return (window as any).CustomEvent !== PatchedCustomEvent;
}
