/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = 'http://localhost:4567/tabindex-zero-after-inside-click';

describe('Tab navigation when tabindex 0 after inside click', () => {
    before(() => {
        browser.url(URL);
    });

    it('should continue delegating focus (forward)', function() {
        browser.click('.second-inside');
        browser.click('.second-outside');
        browser.keys(['Tab']);

        var className = browser.execute(function() {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input.className;
        }).value;

        assert.equal(className, 'first-inside');
    });

    it('should continue delegating focus (backward)', function() {
        browser.click('.second-inside');
        browser.click('.third-outside');
        browser.keys(['Shift', 'Tab']);

        var className = browser.execute(function() {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input.className;
        }).value;

        assert.equal(className, 'third-inside');
    });
});
