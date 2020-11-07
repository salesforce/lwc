/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

const URL = '/invoke-focus-on-click';

describe('focus() method invocation inside a focus handler triggered by a click', () => {
    before(() => {
        browser.url(URL);
    });

    it('should focus the clicked element', function () {
        browser.keys(['Tab']); // input.before
        const button = browser.$(function () {
            return document
                .querySelector('integration-invoke-focus-on-click')
                .shadowRoot.querySelector('integration-child')
                .shadowRoot.querySelector('button');
        });
        button.click(); // click into input
        const active = browser.$(function () {
            return document
                .querySelector('integration-invoke-focus-on-click')
                .shadowRoot.querySelector('integration-child').shadowRoot.activeElement;
        });
        assert.strictEqual(active.getTagName(), 'button');
    });
});
