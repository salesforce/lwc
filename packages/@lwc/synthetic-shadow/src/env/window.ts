/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const {
    addEventListener: windowAddEventListener,
    removeEventListener: windowRemoveEventListener,
    getComputedStyle: windowGetComputedStyle,
    getSelection: windowGetSelection,
} = window;

export {
    windowAddEventListener,
    windowGetComputedStyle,
    windowGetSelection,
    windowRemoveEventListener,
};
