/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tabindex-negative-internal';

describe('Internal tab navigation when tabindex -1', () => {
    before(async () => {
        await browser.url(URL);
    });

    it('should navigate (forward)', async () => {
        const secondInside = await browser.$(function () {
            return document
                .querySelector('integration-tabindex-negative-internal')
                .shadowRoot.querySelector('integration-child')
                .shadowRoot.querySelector('.second-inside');
        });
        await secondInside.click();
        await browser.keys(['Tab']);

        var className = await browser.execute(function () {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input.className;
        });

        assert.strictEqual(className, 'third-inside');
    });

    it('should navigate (backward)', async () => {
        const secondInside = await browser.$(function () {
            return document
                .querySelector('integration-tabindex-negative-internal')
                .shadowRoot.querySelector('integration-child')
                .shadowRoot.querySelector('.second-inside');
        });
        await secondInside.click();
        await browser.keys(['Shift', 'Tab', 'Shift']);

        var className = await browser.execute(function () {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input.className;
        });

        assert.strictEqual(className, 'first-inside');
    });
});
