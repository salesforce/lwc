/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = 'http://localhost:4567/tab-navigation-tabindex-negative';

describe('Tab navigation when tabindex -1', () => {
    before(() => {
        browser.url(URL);
    });

    it('should skip shadow (forward)', function() {
        browser.click('.second-outside');
        browser.keys(['Tab']);

        var className = browser.execute(function() {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        }).value;

        assert.equal(className, 'third-outside');
    });

    it('should skip shadow (backward)', function() {
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
