/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tabindex-zero-internal-tabindex-negative';

describe('Tab navigation when tabindex 0', () => {
    beforeEach(async () => {
        await browser.url(URL);
    });

    it('should skip internal elements contained by a negative tabindex subtree when delegating focus (forward)', async () => {
        const firstInput = await browser.$(function () {
            return document
                .querySelector('integration-tabindex-zero-internal-tabindex-negative')
                .shadowRoot.querySelector('.first');
        });
        await firstInput.click();

        await browser.keys(['Tab']);

        var tagName = await browser.execute(function () {
            var container = document.activeElement;
            var parent = container.shadowRoot.activeElement;
            var input = parent.shadowRoot.activeElement;
            return input.tagName;
        });

        assert.strictEqual(tagName, 'INPUT');
    });

    it('should skip internal elements contained by a negative tabindex subtree when delegating focus (backward)', async () => {
        const lastInput = await browser.$(function () {
            return document
                .querySelector('integration-tabindex-zero-internal-tabindex-negative')
                .shadowRoot.querySelector('.last');
        });
        await lastInput.click();

        await browser.keys(['Shift', 'Tab', 'Shift']);

        var tagName = await browser.execute(function () {
            var container = document.activeElement;
            var parent = container.shadowRoot.activeElement;
            var input = parent.shadowRoot.activeElement;
            return input.tagName;
        });

        assert.strictEqual(tagName, 'INPUT');
    });
});
