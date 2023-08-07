/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

module.exports = function (browser) {
    /**
     * Focus an element.
     *
     * ```js
     * const elm = await browser.$('input');
     * await elm.focus();
     * ```
     */
    browser.addCommand(
        'focus',
        function () {
            return browser.execute(function (target) {
                target.focus();
            }, this);
        },
        true
    );
};
