/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Tabbing into custom element with delegates focus', () => {
    const URL = '/delegates-focus-nested-focusable-custom-elements';

    before(async () => {
        await browser.url(URL);
    });

    it('should apply focus to input in shadow', async () => {
        const span = await browser.$(function () {
            return document
                .querySelector('integration-delegates-focus-nested-focusable-custom-elements')
                .shadowRoot.querySelector('integration-parent')
                .shadowRoot.querySelector('.focusable-span');
        });
        await span.click();
        const active = await browser.$(function () {
            return document
                .querySelector('integration-delegates-focus-nested-focusable-custom-elements')
                .shadowRoot.querySelector('integration-parent').shadowRoot.activeElement;
        });
        assert.strictEqual(await active.getTagName(), 'span');
    });
});
