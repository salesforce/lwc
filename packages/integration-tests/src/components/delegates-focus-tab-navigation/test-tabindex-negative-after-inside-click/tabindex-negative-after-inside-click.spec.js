/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = 'http://localhost:4567/tabindex-negative-after-inside-click';

describe('Tab navigation when tabindex -1 after inside click', () => {
    beforeEach(() => {
        browser.url(URL);
    });

    it('should continue skipping elements (forward)', function() {
        browser.click('.second-inside');
        browser.click('.second-outside');
        browser.keys(['Tab']);

        var className = browser.execute(function() {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        }).value;

        assert.equal(className, 'third-outside');
    });

    it('should continue skipping elements (backward)', function() {
        browser.click('.second-inside');
        browser.click('.third-outside');
        browser.keys(['Shift', 'Tab', 'Shift']);

        var className = browser.execute(function() {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        }).value;

        assert.equal(className, 'second-outside');
    });
});
