/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

 /**
  * Always polyfill the MutationObserver.
  * Should be removed once we start using native shadow dom across the board
  */
export default function detect(): boolean {
    return true;
}
