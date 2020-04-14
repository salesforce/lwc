/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tabindex-zero-after-inside-click';

describe('Tab navigation when tabindex 0 after inside click', () => {
    before(() => {
        browser.url(URL);
    });

    it('should continue delegating focus (forward)', function () {
        const secondInside = browser.$(function () {
            return document
                .querySelector('integration-tabindex-zero-after-inside-click')
                .shadowRoot.querySelector('integration-child')
                .shadowRoot.querySelector('.second-inside');
        });
        secondInside.click();
        const secondOutside = browser.$(function () {
            return document
                .querySelector('integration-tabindex-zero-after-inside-click')
                .shadowRoot.querySelector('.second-outside');
        });
        secondOutside.click();

        browser.keys(['Tab']);

        var className = browser.execute(function () {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input.className;
        });

        assert.equal(className, 'first-inside');
    });

    it('should continue delegating focus (backward)', function () {
        const secondInside = browser.$(function () {
            return document
                .querySelector('integration-tabindex-zero-after-inside-click')
                .shadowRoot.querySelector('integration-child')
                .shadowRoot.querySelector('.second-inside');
        });
        secondInside.click();
        const thirdOutside = browser.$(function () {
            return document
                .querySelector('integration-tabindex-zero-after-inside-click')
                .shadowRoot.querySelector('.third-outside');
        });
        thirdOutside.click();
        browser.keys(['Shift', 'Tab', 'Shift']);

        var className = browser.execute(function () {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input.className;
        });

        assert.equal(className, 'third-inside');
    });
});
