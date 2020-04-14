/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Tabbing into custom element with delegates focus', () => {
    const URL = '/delegates-focus';

    before(() => {
        browser.url(URL);
    });

    it('should apply focus to input in shadow', () => {
        browser.keys(['Tab']);
        const activeFromDocument = browser.$(function () {
            return document.activeElement;
        });
        assert.equal(activeFromDocument.getTagName(), 'integration-delegates-focus');

        const activeFromShadow = browser.$(function () {
            return document.querySelector('integration-delegates-focus').shadowRoot.activeElement;
        });
        assert.equal(activeFromShadow.getTagName(), 'input');
    });

    it('should apply focus to body after exiting in shadow', () => {
        browser.keys(['Tab']);
        const activeFromDocument = browser.$(function () {
            return document.activeElement;
        });

        const tabName = activeFromDocument.getTagName();
        const isTopElement = tabName === 'body' || tabName === 'html';
        assert.ok(isTopElement);
        const activeFromShadow = browser.execute(function () {
            return document.querySelector('integration-delegates-focus').shadowRoot.activeElement;
        });

        assert.equal(activeFromShadow, null);
    });

    it('should apply focus to input in shadow when tabbing backwards', function () {
        browser.keys(['Shift', 'Tab', 'Shift']);
        const activeFromDocument = browser.$(function () {
            return document.activeElement;
        });
        assert.equal(activeFromDocument.getTagName(), 'integration-delegates-focus');
        const activeFromShadow = browser.$(function () {
            return document.querySelector('integration-delegates-focus').shadowRoot.activeElement;
        });
        assert.equal(activeFromShadow.getTagName(), 'input');
    });
});
