/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
describe('when disabled button comes after a component that is delegating focus with tabindex -1', () => {
    const URL = '/disabled-button-after-negative-tabindex';

    beforeEach(() => {
        browser.url(URL);
    });

    it('should transfer focus to the body', function () {
        browser
            .$(function () {
                return document
                    .querySelector('integration-disabled-button-after-negative-tabindex')
                    .shadowRoot.querySelector('.first');
            })
            .click();
        browser.keys(['Tab']); // tab into second input
        browser.keys(['Tab']); // tab over integration-child
        const tagName = browser.execute(function () {
            return document.activeElement.tagName;
        });
        assert.equal(tagName, 'BODY');
    });
});
