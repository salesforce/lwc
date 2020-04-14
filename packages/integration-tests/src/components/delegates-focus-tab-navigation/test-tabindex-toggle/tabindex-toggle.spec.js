/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/tabindex-toggle';

describe('Tab navigation without tabindex', () => {
    before(() => {
        browser.url(URL);
    });

    it('should support tabindex toggling', function () {
        const secondOutside = browser.$(function () {
            return document
                .querySelector('integration-tabindex-toggle')
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

        // Toggle the tabindex <x-child tabindex="-1">
        const toggle = browser.$(function () {
            return document
                .querySelector('integration-tabindex-toggle')
                .shadowRoot.querySelector('.toggle');
        });
        toggle.click();

        secondOutside.click();
        browser.keys(['Tab']);

        className = browser.execute(function () {
            var container = document.activeElement;
            var input = container.shadowRoot.activeElement;
            return input.className;
        });
        assert.equal(className, 'third-outside');

        // Toggle the tabindex <x-child>
        toggle.click();

        secondOutside.click();
        browser.keys(['Tab']);

        className = browser.execute(function () {
            var container = document.activeElement;
            var child = container.shadowRoot.activeElement;
            var input = child.shadowRoot.activeElement;
            return input.className;
        });
        assert.equal(className, 'first-inside');
    });
});
