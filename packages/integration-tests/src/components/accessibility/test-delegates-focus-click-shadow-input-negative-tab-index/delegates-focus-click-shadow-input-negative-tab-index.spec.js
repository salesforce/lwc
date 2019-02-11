/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
describe('Tabbing into custom element with delegates focus', () => {
    const URL = 'http://localhost:4567/delegates-focus-click-shadow-input-negative-tab-index';

    before(() => {
        browser.url(URL);
    });

    it('should apply focus to input in shadow', function () {
        browser.click('.selectable-div');
        browser.click('.negative-tab-index-input');
        browser.waitUntil(() => {
            const active = browser.execute(function () {
                return document.querySelector('integration-delegates-focus-click-shadow-input-negative-tab-index')
                    .shadowRoot.querySelector('integration-child').shadowRoot.activeElement;
            });
            return active.getTagName() === 'input';
        }, 500, 'expect input to be focused');
    });
});
