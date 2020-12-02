/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tab-navigation-tabindex-negative';

describe('Tab navigation when tabindex -1', () => {
    before(async () => {
        await browser.url(URL);
    });

    it('should skip shadow (forward)', async () => {
        const secondInput = await browser.$(function () {
            return document
                .querySelector('integration-tab-navigation-tabindex-negative')
                .shadowRoot.querySelector('.second-outside');
        });
        await secondInput.click();
        await browser.keys(['Tab']);

        var className = await browser.execute(function () {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        });

        assert.strictEqual(className, 'third-outside');
    });

    it('should skip shadow (backward)', async () => {
        const thirdInput = await browser.$(function () {
            return document
                .querySelector('integration-tab-navigation-tabindex-negative')
                .shadowRoot.querySelector('.third-outside');
        });
        await thirdInput.click();
        await browser.keys(['Shift', 'Tab', 'Shift']);

        var className = await browser.execute(function () {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        });

        assert.strictEqual(className, 'second-outside');
    });
});
