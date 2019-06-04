/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Eventually, import the patched MutationObserver polyfill here
// to ensure rest of the framework uses the patched version

const MO = MutationObserver;
const MutationObserverObserve = MO.prototype.observe;
export { MO as MutationObserver, MutationObserverObserve };
