/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// @ts-ignore
const supportsElementInternals = typeof ElementInternals !== 'undefined';
// Use the attachInternals method from HTMLElement.prototype because access to it is removed
// in HTMLBridgeElement, ie: elm.attachInternals is undefined.
// Additionally, cache the attachInternals method to protect against 3rd party monkey-patching.
const attachInternalsFunc = supportsElementInternals
    ? // @ts-ignore
      HTMLElement.prototype.attachInternals
    : () => {
          throw new Error('attachInternals API is not supported in this browser environment.');
      };

export { supportsElementInternals, attachInternalsFunc };
