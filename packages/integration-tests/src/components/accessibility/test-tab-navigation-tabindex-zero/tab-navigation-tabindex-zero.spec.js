/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = 'http://localhost:4567/tab-navigation-tabindex-zero';

describe('Tab navigation when tabindex 0', () => {
    before(() => {
        browser.url(URL);
    });

    it('should focus on custom element when tabbing forward from a sibling element', function() {
        browser.click('.second-outside');
        browser.keys(['Tab']);

        var tagName = browser.execute(function() {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            return child.tagName.toLowerCase();
        }).value;
        assert.equal(tagName, 'integration-child');

        var internal = browser.execute(function() {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input;
        }).value;
        assert.equal(internal, null);
    });

    it('should focus on internal element when tabbing forward twice from a sibling element', function() {
        browser.click('.second-outside');
        browser.keys(['Tab']);
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

    it('should focus on custom element when tabbing backwards out of the shadow', function() {
        browser.click('.first-inside');
        browser.keys(['Shift', 'Tab', 'Shift']);

        var className = browser.execute(function() {
            var activeElement = document.activeElement;
            while (activeElement.shadowRoot && activeElement.shadowRoot.activeElement) {
                activeElement = activeElement.shadowRoot.activeElement;
            }
            return activeElement.className;
        }).value;
        assert.equal(className, 'integration-child');
    });
});
