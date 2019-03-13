/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = 'http://localhost:4567/tabindex-negative-internal';

describe('Internal tab navigation when tabindex -1', () => {
    before(() => {
        browser.url(URL);
    });

    it('should navigate (forward)', function() {
        browser.click('.second-inside');
        browser.keys(['Tab']);

        var className = browser.execute(function() {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input.className;
        }).value;

        assert.equal(className, 'third-inside');
    });

    it('should navigate (backward)', function() {
        browser.click('.second-inside');
        browser.keys(['Shift', 'Tab', 'Shift']);

        var className = browser.execute(function() {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input.className;
        }).value;

        assert.equal(className, 'first-inside');
    });
});
