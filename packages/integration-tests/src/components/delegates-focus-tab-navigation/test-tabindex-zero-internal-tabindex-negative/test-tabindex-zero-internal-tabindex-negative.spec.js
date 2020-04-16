/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tabindex-zero-internal-tabindex-negative';

describe('Tab navigation when tabindex 0', () => {
    beforeEach(() => {
        browser.url(URL);
    });

    it('should skip internal elements contained by a negative tabindex subtree when delegating focus (forward)', function () {
        const firstInput = browser.$(function () {
            return document
                .querySelector('integration-tabindex-zero-internal-tabindex-negative')
                .shadowRoot.querySelector('.first');
        });
        firstInput.click();

        browser.keys(['Tab']);

        var tagName = browser.execute(function () {
            var container = document.activeElement;
            var parent = container.shadowRoot.activeElement;
            var input = parent.shadowRoot.activeElement;
            return input.tagName;
        });

        assert.equal(tagName, 'INPUT');
    });

    it('should skip internal elements contained by a negative tabindex subtree when delegating focus (backward)', function () {
        const lastInput = browser.$(function () {
            return document
                .querySelector('integration-tabindex-zero-internal-tabindex-negative')
                .shadowRoot.querySelector('.last');
        });
        lastInput.click();

        browser.keys(['Shift', 'Tab', 'Shift']);

        var tagName = browser.execute(function () {
            var container = document.activeElement;
            var parent = container.shadowRoot.activeElement;
            var input = parent.shadowRoot.activeElement;
            return input.tagName;
        });

        assert.equal(tagName, 'INPUT');
    });
});
