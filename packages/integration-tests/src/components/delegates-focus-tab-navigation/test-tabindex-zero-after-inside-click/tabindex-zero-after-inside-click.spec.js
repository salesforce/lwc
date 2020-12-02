/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tabindex-zero-after-inside-click';

describe('Tab navigation when tabindex 0 after inside click', () => {
    before(async () => {
        await browser.url(URL);
    });

    it('should continue delegating focus (forward)', async () => {
        const secondInside = await browser.$(function () {
            return document
                .querySelector('integration-tabindex-zero-after-inside-click')
                .shadowRoot.querySelector('integration-child')
                .shadowRoot.querySelector('.second-inside');
        });
        await secondInside.click();
        const secondOutside = await browser.$(function () {
            return document
                .querySelector('integration-tabindex-zero-after-inside-click')
                .shadowRoot.querySelector('.second-outside');
        });
        await secondOutside.click();

        await browser.keys(['Tab']);

        var className = await browser.execute(function () {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input.className;
        });

        assert.strictEqual(className, 'first-inside');
    });

    it('should continue delegating focus (backward)', async () => {
        const secondInside = await browser.$(function () {
            return document
                .querySelector('integration-tabindex-zero-after-inside-click')
                .shadowRoot.querySelector('integration-child')
                .shadowRoot.querySelector('.second-inside');
        });
        await secondInside.click();
        const thirdOutside = await browser.$(function () {
            return document
                .querySelector('integration-tabindex-zero-after-inside-click')
                .shadowRoot.querySelector('.third-outside');
        });
        await thirdOutside.click();
        await browser.keys(['Shift', 'Tab', 'Shift']);

        var className = await browser.execute(function () {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input.className;
        });

        assert.strictEqual(className, 'third-inside');
    });
});
