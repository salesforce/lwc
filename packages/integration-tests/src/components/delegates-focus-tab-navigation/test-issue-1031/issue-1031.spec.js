/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = 'http://localhost:4567/issue-1031';

// Enable after fixing W-5936969
describe.skip('Tab navigation when tabindex -1', () => {
    before(() => {
        browser.url(URL);
    });

    it('should skip child shadow when tabbing after dynamically updating parent tabindex from 0 to -1', function() {
        browser.click('.first-outside');
        browser.keys(['Tab']); // host element
        browser.keys(['Tab']); // second outside input

        var className = browser.execute(function() {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        }).value;

        assert.equal(className, 'second-outside');
    });

    it('should skip child shadow when shift-tabbing after dynamically updating parent tabindex from 0 to -1', function() {
        browser.click('.second-outside');
        browser.keys(['Shift', 'Tab', 'Shift']); // host element
        browser.keys(['Shift', 'Tab', 'Shift']); // first outside input

        var className = browser.execute(function() {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        }).value;

        assert.equal(className, 'first-outside');
    });
});
