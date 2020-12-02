/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tab-navigation-tabindex-zero';

describe('Tab navigation when tabindex 0', () => {
    before(async () => {
        await browser.url(URL);
    });

    it('should focus on custom element when tabbing forward from a sibling element', async () => {
        const secondOutside = await browser.$(function () {
            return document
                .querySelector('integration-tab-navigation-tabindex-zero')
                .shadowRoot.querySelector('.second-outside');
        });
        await secondOutside.click();
        await browser.keys(['Tab']);

        var tagName = await browser.execute(function () {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            return child.tagName.toLowerCase();
        });
        assert.strictEqual(tagName, 'integration-child');

        var internal = await browser.execute(function () {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input;
        });
        assert.strictEqual(internal, null);
    });

    it('should focus on internal element when tabbing forward twice from a sibling element', async () => {
        const secondOutside = await browser.$(function () {
            return document
                .querySelector('integration-tab-navigation-tabindex-zero')
                .shadowRoot.querySelector('.second-outside');
        });
        await secondOutside.click();
        await browser.keys(['Tab']);
        await browser.keys(['Tab']);

        var className = await browser.execute(function () {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input.className;
        });
        assert.strictEqual(className, 'first-inside');
    });

    it('should focus on internal element when tabbing backwards from a sibling element', async () => {
        const thirdOutside = await browser.$(function () {
            return document
                .querySelector('integration-tab-navigation-tabindex-zero')
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

    it('should focus on custom element when tabbing backwards out of the shadow', async () => {
        const firstInside = await browser.$(function () {
            return document
                .querySelector('integration-tab-navigation-tabindex-zero')
                .shadowRoot.querySelector('integration-child')
                .shadowRoot.querySelector('.first-inside');
        });
        await firstInside.click();
        await browser.keys(['Shift', 'Tab', 'Shift']);

        var className = await browser.execute(function () {
            var activeElement = document.activeElement;
            while (activeElement.shadowRoot && activeElement.shadowRoot.activeElement) {
                activeElement = activeElement.shadowRoot.activeElement;
            }
            return activeElement.className;
        });
        assert.strictEqual(className, 'integration-child');
    });
});
