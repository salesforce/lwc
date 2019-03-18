/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = 'http://localhost:4567/manual-delegation';

describe('Tab navigation when component passes tabindex attribute to an internal element', () => {
    before(() => {
        browser.url(URL);
    });

    it('should focus on internal element when tabbing forward from a sibling element', function() {
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

    it('should focus on internal element when tabbing backwards from a sibling element', function() {
        browser.click('.third-outside');
        browser.keys(['Shift', 'Tab', 'Shift']);

        var className = browser.execute(function() {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input.className;
        }).value;
        assert.equal(className, 'third-inside');
    });
});
