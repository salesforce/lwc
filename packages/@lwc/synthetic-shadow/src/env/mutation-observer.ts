/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// There is code in the polyfills that requires access to the unpatched
// Mutation Observer constructor, this the code for that.
// Eventually, the polyfill should uses the patched version, and this file can be removed.

const MO = MutationObserver;
const MutationObserverObserve = MO.prototype.observe;
export { MO as MutationObserver, MutationObserverObserve };
