/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('when disabled button comes after a component that is delegating focus with tabindex -1', () => {
    const URL = '/disabled-button-after-negative-tabindex';

    beforeEach(async () => {
        await browser.url(URL);
    });

    it('should transfer focus to the body', async () => {
        const first = await browser.$(function () {
            return document
                .querySelector('integration-disabled-button-after-negative-tabindex')
                .shadowRoot.querySelector('.first');
        });
        await first.click();
        await browser.keys(['Tab']); // tab into second input
        await browser.keys(['Tab']); // tab over integration-child
        const tagName = await browser.execute(function () {
            return document.activeElement.tagName;
        });
        assert.strictEqual(tagName, 'BODY');
    });
});
