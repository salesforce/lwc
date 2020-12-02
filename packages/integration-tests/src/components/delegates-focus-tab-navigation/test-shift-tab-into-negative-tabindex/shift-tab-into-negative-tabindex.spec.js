/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/shift-tab-into-negative-tabindex';

describe('Delegates focus', () => {
    beforeEach(async () => {
        await browser.url(URL);
    });

    it('should focus the input when clicked', async () => {
        const bottom = await browser.$(function () {
            return document
                .querySelector('integration-shift-tab-into-negative-tabindex')
                .shadowRoot.querySelector('.bottom');
        });
        await bottom.click();

        await browser.keys(['Shift', 'Tab', 'Shift']); // tab backwards over integration-child

        const className = await browser.execute(function () {
            const container = document.activeElement;
            const activeElement = container.shadowRoot.activeElement;
            return activeElement.className;
        });

        assert.strictEqual(className, 'top');
    });
});
