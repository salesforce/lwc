/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

module.exports = function (browser) {
    /**
     * Returns a WebdriverIO element representing document active element. If no element is active,
     * the command returns `null`.
     *
     * ```js
     * const activeElement = await browser.activeElement();
     * ```
     */
    browser.addCommand('activeElement', function () {
        return this.$(function () {
            return document.activeElement;
        });
    });
};
