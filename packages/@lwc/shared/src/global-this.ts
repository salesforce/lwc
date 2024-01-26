/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// See browser support for globalThis:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis#browser_compatibility

/* istanbul ignore next */
// @ts-ignore

//removed the polyfill as no longer needed.
//const _globalThis = typeof globalThis === 'object' ? globalThis : window;
export { globalThis };
