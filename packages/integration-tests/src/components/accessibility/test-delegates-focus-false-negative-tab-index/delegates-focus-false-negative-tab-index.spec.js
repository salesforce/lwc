/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Tabbing into custom element with delegates focus', () => {
    const URL = 'http://localhost:4567/delegates-focus-false-negative-tab-index';
    let element;

    before(() => {
        browser.url(URL);
    });

    it('should not apply focus to input in shadow', () => {
        browser.keys(['Tab']);
        browser.keys(['Tab']);

        browser.waitUntil(() => {
            const activeFromDocument = browser.execute(function () {
                return document.activeElement;
            });

            return activeFromDocument.getTagName() === 'integration-delegates-focus-false-negative-tab-index'
        }, 500, 'expect integration-delegates-focus-false-negative-tab-index to be focused');

        browser.waitUntil(() => {
            const activeFromShadow = browser.execute(function () {
                return document.querySelector('integration-delegates-focus-false-negative-tab-index').shadowRoot.activeElement;
            });

            return activeFromShadow.getTagName() === 'a';
        }, 500, 'expect anchor to be focused');
    });
});
