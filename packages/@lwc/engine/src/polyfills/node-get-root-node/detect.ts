/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

 /**
 * Always polyfill Node.prototype.getRootNode until native shadow is enabled for all components
 */
export default function detect(): boolean {
    return true;
}
