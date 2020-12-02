/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/nested-tabindex-negative';

describe('nested components with negative tabindex', () => {
    before(async () => {
        await browser.url(URL);
    });

    it('should focus the input when clicked', async () => {
        await browser.keys(['Tab']); // focus button
        const input = await browser.$(function () {
            return document
                .querySelector('integration-nested-tabindex-negative')
                .shadowRoot.querySelector('integration-parent')
                .shadowRoot.querySelector('integration-child')
                .shadowRoot.querySelector('input');
        });
        await input.click(); // click into input
        const active = await browser.$(function () {
            return document
                .querySelector('integration-nested-tabindex-negative')
                .shadowRoot.querySelector('integration-parent')
                .shadowRoot.querySelector('integration-child').shadowRoot.activeElement;
        });
        assert.strictEqual(await active.getTagName(), 'input');
    });
});
