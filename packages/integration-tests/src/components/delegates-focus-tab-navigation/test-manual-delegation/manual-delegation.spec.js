/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/manual-delegation';

describe('Tab navigation when component passes tabindex attribute to an internal element', () => {
    before(() => {
        browser.url(URL);
    });

    it('should focus on internal element when tabbing forward from a sibling element', function () {
        const secondOutside = browser.$(function () {
            return document
                .querySelector('integration-manual-delegation')
                .shadowRoot.querySelector('.second-outside');
        });
        secondOutside.click();
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
                .querySelector('integration-manual-delegation')
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
});
