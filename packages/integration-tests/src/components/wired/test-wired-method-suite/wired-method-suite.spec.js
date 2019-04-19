/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');

describe('Component with a wired method', () => {
    const URL = 'http://localhost:4567/wired-method-suite';

    before(() => {
        browser.url(URL);
    });

    it('should display data correctly', () => {
        const todoText = browser.execute(function() {
            return document
                .querySelector('integration-wired-method-suite')
                .shadowRoot.querySelector('integration-wired-method').shadowRoot.textContent;
        });
        assert.equal(todoText.value, 'Title:task 0 Completed:true');
    });

    it('should update data correctly', () => {
        browser.execute(function() {
            document
                .querySelector('integration-wired-method-suite')
                .shadowRoot.querySelector('button')
                .click();
        });
        const todoText = browser.execute(function() {
            return document
                .querySelector('integration-wired-method-suite')
                .shadowRoot.querySelector('integration-wired-method').shadowRoot.textContent;
        });
        assert.equal(todoText.value, 'Title:task 1 Completed:false');
    });
});
