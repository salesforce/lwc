/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tabindex-zero-internal';

describe('Internal tab navigation when tabindex 0', () => {
    before(() => {
        browser.url(URL);
    });

    it('should navigate (forward)', function () {
        const secondInside = browser.$(function () {
            return document
                .querySelector('integration-tabindex-zero-internal')
                .shadowRoot.querySelector('integration-child')
                .shadowRoot.querySelector('.second-inside');
        });
        secondInside.click();
        browser.keys(['Tab']);

        var className = browser.execute(function () {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input.className;
        });

        assert.equal(className, 'third-inside');
    });

    it('should navigate (backward)', function () {
        const secondInside = browser.$(function () {
            return document
                .querySelector('integration-tabindex-zero-internal')
                .shadowRoot.querySelector('integration-child')
                .shadowRoot.querySelector('.second-inside');
        });
        secondInside.click();
        browser.keys(['Shift', 'Tab', 'Shift']);

        var className = browser.execute(function () {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input.className;
        });

        assert.equal(className, 'first-inside');
    });
});
