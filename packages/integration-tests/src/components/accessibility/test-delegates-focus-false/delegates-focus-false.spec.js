/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Tabbing into custom element with delegates focus', () => {
    const URL = '/delegates-focus-false';

    before(() => {
        browser.url(URL);
    });

    it('should not apply focus to input in shadow', () => {
        browser.keys(['Tab']);
        browser.keys(['Tab']);
        const activeFromDocument = browser.$(function () {
            return document.activeElement;
        });

        assert.equal(activeFromDocument.getTagName(), 'integration-delegates-focus-false');
        const activeFromShadow = browser.$(function () {
            return document.querySelector(
                'integration-delegates-focus-false'
            ).shadowRoot.activeElement;
        });
        assert.equal(activeFromShadow.getTagName(), 'integration-child');
        browser.keys(['Tab']);
        browser.keys(['Tab']);
        const activeFromShadowAfter = browser.$(function () {
            return document
                .querySelector('integration-delegates-focus-false')
                .shadowRoot.querySelector('integration-child').shadowRoot.activeElement;
        });
        assert.equal(activeFromShadowAfter.getTagName(), 'input');
    });
});
