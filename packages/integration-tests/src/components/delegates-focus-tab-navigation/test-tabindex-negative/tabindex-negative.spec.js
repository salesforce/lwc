/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tabindex-negative';

describe('Tab navigation when tabindex -1', () => {
    before(() => {
        browser.url(URL);
    });

    it('should skip shadow (forward)', function () {
        const secondOutside = browser.$(function () {
            return document
                .querySelector('integration-tabindex-negative')
                .shadowRoot.querySelector('.second-outside');
        });
        secondOutside.click();
        browser.keys(['Tab']);

        var className = browser.execute(function () {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        });

        assert.equal(className, 'third-outside');
    });

    it('should skip shadow (backward)', function () {
        const thirdOutside = browser.$(function () {
            return document
                .querySelector('integration-tabindex-negative')
                .shadowRoot.querySelector('.third-outside');
        });
        thirdOutside.click();
        browser.keys(['Shift', 'Tab', 'Shift']);

        var className = browser.execute(function () {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        });

        assert.equal(className, 'second-outside');
    });
});
