/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('Delegates focus', () => {
    const URL = '/focusable-span-after-negative-tabindex';

    beforeEach(() => {
        browser.url(URL);
    });

    it('should focus the input when clicked', function () {
        browser
            .$(function () {
                return document
                    .querySelector('integration-focusable-span-after-negative-tabindex')
                    .shadowRoot.querySelector('.first');
            })
            .click();

        browser.keys(['Tab']); // tab over integration-child

        const tagName = browser.execute(function () {
            var container = document.activeElement;
            var activeElement = container.shadowRoot.activeElement;
            return activeElement.tagName;
        });

        assert.equal(tagName, 'SPAN');
    });
});
