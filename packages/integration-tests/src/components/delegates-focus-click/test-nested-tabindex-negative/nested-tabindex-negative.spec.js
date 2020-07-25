/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/nested-tabindex-negative';

describe('nested components with negative tabindex', () => {
    before(() => {
        browser.url(URL);
    });

    it('should focus the input when clicked', function () {
        browser.keys(['Tab']); // focus button
        const input = browser.$(function () {
            return document
                .querySelector('integration-nested-tabindex-negative')
                .shadowRoot.querySelector('integration-parent')
                .shadowRoot.querySelector('integration-child')
                .shadowRoot.querySelector('input');
        });
        input.click(); // click into input
        const active = browser.$(function () {
            return document
                .querySelector('integration-nested-tabindex-negative')
                .shadowRoot.querySelector('integration-parent')
                .shadowRoot.querySelector('integration-child').shadowRoot.activeElement;
        });
        assert.equal(active.getTagName(), 'input');
    });
});
