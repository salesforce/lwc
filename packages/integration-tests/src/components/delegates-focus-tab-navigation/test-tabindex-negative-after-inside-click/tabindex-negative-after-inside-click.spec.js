/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tabindex-negative-after-inside-click';

describe('Tab navigation when tabindex -1 after inside click', () => {
    beforeEach(() => {
        browser.url(URL);
    });

    it('should continue skipping elements (forward)', function () {
        const secondInside = browser.$(function () {
            return document
                .querySelector('integration-tabindex-negative-after-inside-click')
                .shadowRoot.querySelector('integration-child[data-id=click-target]')
                .shadowRoot.querySelector('.second-inside');
        });
        secondInside.click();
        const secondOutside = browser.$(function () {
            return document
                .querySelector('integration-tabindex-negative-after-inside-click')
                .shadowRoot.querySelector('.second-outside');
        });
        secondOutside.click();
        browser.keys(['Tab']);

        var className = browser.execute(function () {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        });

        assert.equal(className, 'third-outside');
    });

    it('should continue skipping elements after navigating out (forward)', function () {
        const secondInside = browser.$(function () {
            return document
                .querySelector('integration-tabindex-negative-after-inside-click')
                .shadowRoot.querySelector('integration-child[data-id=click-target]')
                .shadowRoot.querySelector('.second-inside');
        });
        secondInside.click();
        browser.keys(['Tab']); // third inside
        browser.keys(['Tab']); // third outside

        var className = browser.execute(function () {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        });

        assert.equal(className, 'third-outside');
    });

    it('should continue skipping elements (backward)', function () {
        const secondInside = browser.$(function () {
            return document
                .querySelector('integration-tabindex-negative-after-inside-click')
                .shadowRoot.querySelector('integration-child[data-id=click-target]')
                .shadowRoot.querySelector('.second-inside');
        });
        secondInside.click();
        const thirdOutside = browser.$(function () {
            return document
                .querySelector('integration-tabindex-negative-after-inside-click')
                .shadowRoot.querySelector('.third-outside');
        });
        thirdOutside.click();
        browser.keys(['Shift', 'Tab', 'Shift']);

        var className = browser.execute(function () {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        });

        assert.equal(className, 'second-outside');
    });

    it('should continue skipping elements after navigating out (backwards)', function () {
        const secondInside = browser.$(function () {
            return document
                .querySelector('integration-tabindex-negative-after-inside-click')
                .shadowRoot.querySelector('integration-child[data-id=click-target]')
                .shadowRoot.querySelector('.second-inside');
        });
        secondInside.click();
        browser.keys(['Shift', 'Tab', 'Shift']); // first inside
        browser.keys(['Shift', 'Tab', 'Shift']); // second outside

        var className = browser.execute(function () {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        });

        assert.equal(className, 'second-outside');
    });
});
