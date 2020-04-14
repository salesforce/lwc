/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Tabbing into custom element proceeding an invisible button', () => {
    const URL = '/delegates-focus-next-sibling-visibility-false';

    before(() => {
        browser.url(URL);
    });

    it('should apply focus to the document body', function () {
        browser.keys(['Tab']);
        browser.keys(['Tab']);
        const activeFromDocument = browser.$(function () {
            return document.activeElement;
        });
        assert.equal(activeFromDocument.getTagName(), 'body');
    });
});
