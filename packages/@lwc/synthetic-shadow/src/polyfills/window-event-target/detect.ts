/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export default function detect(): boolean {
    // In IE11, Window is not an instance of EventTarget, in which case we need to patch the global listeners
    return Object.getOwnPropertyDescriptor(Window.prototype, 'addEventListener') !== undefined;
}
