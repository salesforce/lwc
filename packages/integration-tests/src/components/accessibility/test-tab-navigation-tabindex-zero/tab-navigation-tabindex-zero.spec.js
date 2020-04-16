/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tab-navigation-tabindex-zero';

describe('Tab navigation when tabindex 0', () => {
    before(() => {
        browser.url(URL);
    });

    it('should focus on custom element when tabbing forward from a sibling element', function () {
        const secondOutside = browser.$(function () {
            return document
                .querySelector('integration-tab-navigation-tabindex-zero')
                .shadowRoot.querySelector('.second-outside');
        });
        secondOutside.click();
        browser.keys(['Tab']);

        var tagName = browser.execute(function () {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            return child.tagName.toLowerCase();
        });
        assert.equal(tagName, 'integration-child');

        var internal = browser.execute(function () {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input;
        });
        assert.equal(internal, null);
    });

    it('should focus on internal element when tabbing forward twice from a sibling element', function () {
        const secondOutside = browser.$(function () {
            return document
                .querySelector('integration-tab-navigation-tabindex-zero')
                .shadowRoot.querySelector('.second-outside');
        });
        secondOutside.click();
        browser.keys(['Tab']);
        browser.keys(['Tab']);

        var className = browser.execute(function () {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input.className;
        });
        assert.equal(className, 'first-inside');
    });

    it('should focus on internal element when tabbing backwards from a sibling element', function () {
        const thirdOutside = browser.$(function () {
            return document
                .querySelector('integration-tab-navigation-tabindex-zero')
                .shadowRoot.querySelector('.third-outside');
        });
        thirdOutside.click();
        browser.keys(['Shift', 'Tab', 'Shift']);

        var className = browser.execute(function () {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input.className;
        });
        assert.equal(className, 'third-inside');
    });

    it('should focus on custom element when tabbing backwards out of the shadow', function () {
        const firstInside = browser.$(function () {
            return document
                .querySelector('integration-tab-navigation-tabindex-zero')
                .shadowRoot.querySelector('integration-child')
                .shadowRoot.querySelector('.first-inside');
        });
        firstInside.click();
        browser.keys(['Shift', 'Tab', 'Shift']);

        var className = browser.execute(function () {
            var activeElement = document.activeElement;
            while (activeElement.shadowRoot && activeElement.shadowRoot.activeElement) {
                activeElement = activeElement.shadowRoot.activeElement;
            }
            return activeElement.className;
        });
        assert.equal(className, 'integration-child');
    });
});
