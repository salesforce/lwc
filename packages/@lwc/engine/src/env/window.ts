/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
let {
    addEventListener: windowAddEventListener,
    removeEventListener: windowRemoveEventListener,
} = window;

/**
 * This trick to try to pick up the __lwcOriginal__ out of the intrinsic is to please
 * jsdom, who usually reuse intrinsic between different document.
 */
// @ts-ignore jsdom
windowAddEventListener = windowAddEventListener.__lwcOriginal__ || windowAddEventListener;
// @ts-ignore jsdom
windowRemoveEventListener = windowRemoveEventListener.__lwcOriginal__ || windowRemoveEventListener;

export { windowAddEventListener, windowRemoveEventListener };
