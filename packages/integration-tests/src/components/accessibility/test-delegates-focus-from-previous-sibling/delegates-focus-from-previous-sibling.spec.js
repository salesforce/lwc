/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Tabbing into custom element with delegates focus', () => {
    const URL = '/delegates-focus-from-previous-sibling';

    before(() => {
        browser.url(URL);
    });

    it('should apply focus to input in shadow', function () {
        browser.keys(['Tab']);
        browser.keys(['Tab']);

        const activeFromDocument = browser.$(function () {
            return document.activeElement;
        });
        assert.equal(
            activeFromDocument.getTagName(),
            'integration-delegates-focus-from-previous-sibling'
        );
        const activeFromShadow = browser.$(function () {
            return document.querySelector(
                'integration-delegates-focus-from-previous-sibling'
            ).shadowRoot.activeElement;
        });

        assert.equal(activeFromShadow.getTagName(), 'integration-child');
    });
});
