/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export default function detect(): boolean {
    // Note: when using this in mobile apps, we might have a DOM that does not support iframes.
    return typeof HTMLIFrameElement !== 'undefined';
}
