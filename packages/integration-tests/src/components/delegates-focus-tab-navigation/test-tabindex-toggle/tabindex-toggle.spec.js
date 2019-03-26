/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = 'http://localhost:4567/tabindex-toggle';

describe('Tab navigation without tabindex', () => {
    before(() => {
        browser.url(URL);
    });

    it('should support tabindex toggling', function() {
        browser.click('.second-outside');
        browser.keys(['Tab']);

        var className = browser.execute(function() {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input.className;
        }).value;
        assert.equal(className, 'first-inside');

        // Toggle the tabindex <x-child tabindex="-1">
        browser.click('.toggle');

        browser.click('.second-outside');
        browser.keys(['Tab']);

        className = browser.execute(function() {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        }).value;
        assert.equal(className, 'third-outside');

        // Toggle the tabindex <x-child>
        browser.click('.toggle');

        browser.click('.second-outside');
        browser.keys(['Tab']);

        className = browser.execute(function() {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input.className;
        }).value;
        assert.equal(className, 'first-inside');
    });
});
