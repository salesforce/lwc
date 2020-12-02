/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('Delegates focus', () => {
    const URL = '/delegate-focus-click-input-in-negative-tabindex';

    before(async () => {
        await browser.url(URL);
    });

    it('should focus the input when clicked', async () => {
        await browser.keys(['Tab']); // focus first anchor
        const input = await browser.$(function () {
            return document
                .querySelector('integration-delegate-focus-click-input-in-negative-tabindex')
                .shadowRoot.querySelector('integration-child')
                .shadowRoot.querySelector('input');
        });

        await input.click(); // click into input
        const active = await browser.$(function () {
            return document
                .querySelector('integration-delegate-focus-click-input-in-negative-tabindex')
                .shadowRoot.querySelector('integration-child').shadowRoot.activeElement;
        });

        const tagName = await active.getTagName();
        assert.strictEqual(tagName, 'input');
    });
});
