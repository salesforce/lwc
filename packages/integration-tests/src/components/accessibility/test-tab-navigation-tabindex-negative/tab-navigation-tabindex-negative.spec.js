/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tab-navigation-tabindex-negative';

describe('Tab navigation when tabindex -1', () => {
    before(() => {
        browser.url(URL);
    });

    it('should skip shadow (forward)', function () {
        const secondInput = browser.$(function () {
            return document
                .querySelector('integration-tab-navigation-tabindex-negative')
                .shadowRoot.querySelector('.second-outside');
        });
        secondInput.click();
        browser.keys(['Tab']);

        var className = browser.execute(function () {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        });

        assert.equal(className, 'third-outside');
    });

    it('should skip shadow (backward)', function () {
        const thirdInput = browser.$(function () {
            return document
                .querySelector('integration-tab-navigation-tabindex-negative')
                .shadowRoot.querySelector('.third-outside');
        });
        thirdInput.click();
        browser.keys(['Shift', 'Tab', 'Shift']);

        var className = browser.execute(function () {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        });

        assert.equal(className, 'second-outside');
    });
});
