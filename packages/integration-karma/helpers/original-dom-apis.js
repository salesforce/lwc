/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

window.originalDomApis = (function () {
    const targetGetter = Object.getOwnPropertyDescriptor(Event.prototype, 'target').get;

    return {
        targetGetter,
    };
})();
