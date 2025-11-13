/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

module.exports = function (browser) {
    /**
     * Returns a WebdriverIO element representing the shadow active element for a given host
     * element. If the shadow tree doesn't have an active element, the command returns `null`.
     *
     * ```js
     * const host = await $('x-foo');
     * const shadowActiveElement = await host.activeElementShadow();
     * ```
     */
    browser.addCommand(
        'activeElementShadow',
        function () {
            return this.$(function () {
                if (!this.shadowRoot) {
                    throw new Error('Invalid target for "activeElementShadow"');
                }

                return this.shadowRoot.activeElement;
            });
        },
        true
    );
};
