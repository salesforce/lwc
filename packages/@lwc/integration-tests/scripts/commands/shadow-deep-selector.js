/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

module.exports = function (browser) {
    /**
     * Returns a WebdriverIO element for a given list of selectors. The first selector runs in the
     * scope of the document, and the subsequent once runs in the shadow tree returned by the
     * previous selector.
     *
     * ```js
     * const bar = await browser.shadowDeep$('x-foo', 'x-bar');
     * const baz = await browser.shadowDeep$('x-foo', 'x-bar', 'x-baz');
     * ```
     */
    browser.addCommand('shadowDeep$', async function (...selectors) {
        const [head, ...rest] = selectors;

        let elm = await this.$(head);
        for (const selector of rest) {
            elm = await elm.shadow$(selector);
        }

        return elm;
    });
};
