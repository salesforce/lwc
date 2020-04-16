/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/issue-1031';

describe('issue #1031', () => {
    before(() => {
        browser.url(URL);
    });

    it('should skip child shadow when tabbing after dynamically updating parent tabindex from 0 to -1', function () {
        const initialize = browser.$(function () {
            return document
                .querySelector('integration-issue-1031')
                .shadowRoot.querySelector('.initialize');
        });
        initialize.click(); // init tabindex to 0
        const firstOutside = browser.$(function () {
            return document
                .querySelector('integration-issue-1031')
                .shadowRoot.querySelector('.first-outside');
        });
        firstOutside.click();
        browser.keys(['Tab']); // host element
        browser.keys(['Tab']); // second outside input

        var className = browser.execute(function () {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        });

        assert.equal(className, 'second-outside');
    });

    it('should skip child shadow when shift-tabbing after dynamically updating parent tabindex from 0 to -1', function () {
        const initialize = browser.$(function () {
            return document
                .querySelector('integration-issue-1031')
                .shadowRoot.querySelector('.initialize');
        });
        initialize.click(); // init tabindex to 0
        const secondOutside = browser.$(function () {
            return document
                .querySelector('integration-issue-1031')
                .shadowRoot.querySelector('.second-outside');
        });
        secondOutside.click();
        browser.keys(['Shift', 'Tab', 'Shift']); // <integration-parent>
        browser.keys(['Shift', 'Tab', 'Shift']); // first outside input

        var className = browser.execute(function () {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        });

        assert.equal(className, 'first-outside');
    });
});
