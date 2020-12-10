/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

module.exports = function (browser) {
    /**
     * Returns a WebdriverIO element representing deepest the active element from the document. If
     * the active element is an element with an open shadow root, the command will keep traversing
     * the shadow tree. If the document doesn't have an active element, the command returns `null`.
     *
     * ```js
     * const shadowActiveElement = await browser.activeElementShadowDeep();
     * ```
     */
    browser.addCommand('activeElementShadowDeep', function () {
        return this.$(function () {
            var active = document.activeElement;
            while (active.shadowRoot && active.shadowRoot.activeElement) {
                active = active.shadowRoot.activeElement;
            }
            return active;
        });
    });
};
