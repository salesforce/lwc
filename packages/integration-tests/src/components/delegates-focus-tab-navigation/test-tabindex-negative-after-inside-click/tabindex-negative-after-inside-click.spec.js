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
        const secondInside = browser.execute(function() {
            return document
                .querySelector('integration-tabindex-negative-after-inside-click')
                .shadowRoot.querySelector('integration-child')
                .shadowRoot.querySelector('.second-inside');
        });
        secondInside.click();
        const secondOutside = browser.execute(function() {
            return document
                .querySelector('integration-tabindex-negative-after-inside-click')
                .shadowRoot.querySelector('.second-outside');
        });
        secondOutside.click();
        browser.keys(['Tab']);

        var className = browser.execute(function() {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        }).value;

        assert.equal(className, 'third-outside');
    });

    it('should continue skipping elements (backward)', function() {
        const secondInside = browser.execute(function() {
            return document
                .querySelector('integration-tabindex-negative-after-inside-click')
                .shadowRoot.querySelector('integration-child')
                .shadowRoot.querySelector('.second-inside');
        });
        secondInside.click();
        const thirdOutside = browser.execute(function() {
            return document
                .querySelector('integration-tabindex-negative-after-inside-click')
                .shadowRoot.querySelector('.third-outside');
        });
        thirdOutside.click();
        browser.keys(['Shift', 'Tab', 'Shift']);

        var className = browser.execute(function() {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        }).value;

        assert.equal(className, 'second-outside');
    });
});
