/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/manual-delegation';

describe('Tab navigation when component passes tabindex attribute to an internal element', () => {
    before(async () => {
        await browser.url(URL);
    });

    it('should focus on internal element when tabbing forward from a sibling element', async () => {
        const secondOutside = await browser.$(function () {
            return document
                .querySelector('integration-manual-delegation')
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

    it('should focus on internal element when tabbing backwards from a sibling element', async () => {
        const thirdOutside = await browser.$(function () {
            return document
                .querySelector('integration-manual-delegation')
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
