/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { window } from '../env/global';

const {
    addEventListener: windowAddEventListener,
    removeEventListener: windowRemoveEventListener,
    getComputedStyle: windowGetComputedStyle,
    getSelection: windowGetSelection,
    setTimeout: windowSetTimeout,
} = window;

export {
    windowAddEventListener,
    windowGetComputedStyle,
    windowGetSelection,
    windowRemoveEventListener,
    windowSetTimeout,
};
