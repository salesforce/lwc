/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tabindex-toggle';

describe('Tab navigation without tabindex', () => {
    before(async () => {
        await browser.url(URL);
    });

    it('should support tabindex toggling', async () => {
        const secondOutside = await browser.$(function () {
            return document
                .querySelector('integration-tabindex-toggle')
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

        // Toggle the tabindex <x-child tabindex="-1">
        const toggle = await browser.$(function () {
            return document
                .querySelector('integration-tabindex-toggle')
                .shadowRoot.querySelector('.toggle');
        });
        await toggle.click();

        await secondOutside.click();
        await browser.keys(['Tab']);

        className = await browser.execute(function () {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        });
        assert.strictEqual(className, 'third-outside');

        // Toggle the tabindex <x-child>
        await toggle.click();

        await secondOutside.click();
        await browser.keys(['Tab']);

        className = await browser.execute(function () {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input.className;
        });
        assert.strictEqual(className, 'first-inside');
    });
});
